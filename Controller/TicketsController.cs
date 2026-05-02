using Microsoft.AspNetCore.Mvc;
using TicketFlowAPI.Models;
using MySql.Data.MySqlClient;
using TicketFlowAPI.Services;
using System;

namespace TicketFlowAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper = new DatabaseHelper();
              private readonly PredictionService _predictionService;

        public TicketsController(PredictionService predictionService)
            {
                
                _predictionService = predictionService; 
            }


        [HttpPost("submit")]
        public async Task<IActionResult> SubmitTicket([FromBody] ActiveTicket incomingTicket)
        {
            try
            {

                var prediction = await _predictionService.PredictTicketAsync(incomingTicket.Description);
                
                if (prediction == null)
                {
                    return StatusCode(503, new { error = "AI service unavailable - check API key" });
                }
                

                string category = prediction.Value.Category;
                string priorityLevel = prediction.Value.Label; 
                int priorityWeight = prediction.Value.Weight;  
                
                string sql = @"
                    INSERT INTO ActiveTickets (SubmitterID, Description, Location, Category, PriorityLevel, PriorityWeight, Status) 
                    VALUES (@SubmitterID, @Description, @Location, @Category, @PriorityLevel, @PriorityWeight, 'Open')";
                
                var parameters = new Dictionary<string, object>
                {
                    { "@SubmitterID", incomingTicket.SubmitterID },
                    { "@Description", incomingTicket.Description },
                    { "@Location", incomingTicket.Location },
                    { "@Category", category },
                    { "@PriorityLevel", priorityLevel },
                    { "@PriorityWeight", priorityWeight }
                };
                
                _dbHelper.ExecuteModifyQuery(sql, parameters);
                
                return Ok(new { 
                    message = "Ticket submitted! AI routed it to: " + category,
                    category = category,
                    priority = priorityLevel
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed: " + ex.Message });
            }
        }
    
        [HttpGet("active")]
        public IActionResult GetActiveTickets()
        {
            try
            {
                
                string sql = "SELECT * FROM ActiveTickets ORDER BY PriorityWeight ASC, CreatedAt ASC";

   
                var dataTable = _dbHelper.ExecuteSelectQuery(sql);

  
                var tickets = new System.Collections.Generic.List<object>();
                
                foreach (System.Data.DataRow row in dataTable.Rows)
                {
                    tickets.Add(new
                    {
                        TicketID = row["TicketID"],
                        SubmitterID = row["SubmitterID"],
                        Description = row["Description"],
                        Location = row["Location"], 
                        Category = row["Category"],
                        PriorityLevel = row["PriorityLevel"],
                        PriorityWeight = row["PriorityWeight"],
                        Status = row["Status"],
                        CreatedAt = row["CreatedAt"]
                    });
                }

                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch tickets: " + ex.Message });
            }
        }

        [HttpPost("resolve")]
        public IActionResult ResolveTicket(int ticketId, int adminId, string note)
        {
            using (var connection = _dbHelper.GetConnection())
            {
                connection.Open();
                var transaction = connection.BeginTransaction();

                try
                {
                    string copySql = @"
                        INSERT INTO TicketArchive (TicketID, SubmitterID, Description, Location, Category, FinalPriority, CreatedAt)
                        SELECT TicketID, SubmitterID, Description, Location, Category, PriorityLevel, CreatedAt 
                        FROM ActiveTickets WHERE TicketID = @TicketID";
                        
                    using (var cmd = new MySqlCommand(copySql, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@TicketID", ticketId);
                        cmd.ExecuteNonQuery();
                    }

                    string noteSql = @"
                        INSERT INTO ResolutionNotes (TicketID, AdminID, NoteText) 
                        VALUES (@TicketID, @AdminID, @Note)";
                    
                    using (var cmd = new MySqlCommand(noteSql, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@TicketID", ticketId);
                        cmd.Parameters.AddWithValue("@AdminID", adminId);
                        cmd.Parameters.AddWithValue("@Note", note);
                        cmd.ExecuteNonQuery();
                    }

                    string updateSql = "UPDATE ActiveTickets SET Status = 'Resolved' WHERE TicketID = @TicketID";
                    
                    using (var cmd = new MySqlCommand(updateSql, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@TicketID", ticketId);
                        cmd.ExecuteNonQuery();
                    }
                    
                    transaction.Commit();
                    return Ok(new { message = "Ticket resolved successfully." });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, new { error = "Resolution failed: " + ex.Message });
                }
            }
        }

        [HttpGet("all")]
        public IActionResult GetAllTickets()
        {
            try
            {

                string sql = @"
                    SELECT t.*, n.NoteText, a.CreatedAt
                    FROM ActiveTickets t
                    LEFT JOIN ResolutionNotes n ON t.TicketID = n.TicketID
                    LEFT JOIN ActiveTickets a ON n.TicketID = a.TicketID
                    ORDER BY t.CreatedAt DESC";
                
                var dataTable = _dbHelper.ExecuteSelectQuery(sql);

                
                var ticketList = new System.Collections.Generic.List<TicketResponse>();

                foreach (System.Data.DataRow row in dataTable.Rows)
                {
                    ticketList.Add(new TicketResponse
                    {
                        TicketID = System.Convert.ToInt32(row["TicketID"]),
                        SubmitterID = Convert.ToInt32(row["SubmitterID"]),
                        Description = row["Description"].ToString(),
                        Location = row["Location"]?.ToString() ?? "Not specified",
                        Category = row["Category"].ToString(),
                        PriorityLevel = row["PriorityLevel"]?.ToString() ?? "Standard", 
                        Status = row["Status"].ToString(),
                        ResolutionNote = row["NoteText"] != System.DBNull.Value ? row["NoteText"].ToString() : null,
                        CreatedAt = System.Convert.ToDateTime(row["CreatedAt"])
                    });
                }

                return Ok(ticketList);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch admin queue: " + ex.Message });
            }
        }

        [HttpPut("update-status")]
        public IActionResult UpdateStatus(int ticketId, string status)
        {
            try
            {
                if (status != "Open" && status != "In Progress" && status != "Resolved")
                {
                    return BadRequest(new { error = "Invalid status. Use: Open, In Progress, or Resolved" });
                }
                
                string sql = "UPDATE ActiveTickets SET Status = @Status WHERE TicketID = @TicketID";
                var parameters = new Dictionary<string, object>
                {
                    { "@Status", status },
                    { "@TicketID", ticketId }
                };
                
                int rowsAffected = _dbHelper.ExecuteModifyQuery(sql, parameters);
                
                if (rowsAffected > 0)
                {
                    return Ok(new { message = $"Ticket #{ticketId} status updated to {status}" });
                }
                else
                {
                    return NotFound(new { error = $"Ticket #{ticketId} not found" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update status: " + ex.Message });
            }
        }
                


  
            

    }
    
    
}