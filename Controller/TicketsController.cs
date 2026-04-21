using Microsoft.AspNetCore.Mvc;
using TicketFlowAPI.Models;
using TicketFlowAPI.Services;
using System;

namespace TicketFlowAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper = new DatabaseHelper();

        [HttpPost("submit")]
        public IActionResult SubmitTicket([FromBody] ActiveTicket incomingTicket)
        {
            try
            {
        
                string predictedCategory = "Hardware"; 
                int priorityWeight = 3;

                    string sql = @"
                        INSERT INTO ActiveTickets (SubmitterID, Description, Location, Category, PriorityLevel, PriorityWeight) 
                        VALUES (@SubmitterID, @Description, @Location, @Category, @PriorityLevel, @PriorityWeight)";

                    // 2. Package the variables into a secure dictionary
                    var parameters = new Dictionary<string, object>
                    {
                        { "@SubmitterID", incomingTicket.SubmitterID },
                        { "@Description", incomingTicket.Description },
                        { "@Location", incomingTicket.Location},
                        { "@Category", predictedCategory},
                        { "@PriorityLevel", "Standard" },
                        { "@PriorityWeight", priorityWeight },
                        { "@Status", "Open" }
                    };

                _dbHelper.ExecuteModifyQuery(sql,parameters);

                return Ok(new { message = "Ticket submitted! AI routed it to: " + predictedCategory });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database failed: " + ex.Message });
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
                        
                        using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(copySql, connection, transaction))
                        {
                            cmd.Parameters.AddWithValue("@TicketID", ticketId);
                            cmd.ExecuteNonQuery();
                        }

                    
                    string noteSql = @"
                    INSERT INTO ResolutionNotes (TicketID, AdminID, NoteText) 
                    VALUES (@TicketID, @AdminID, @Note)";
                
                    using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(noteSql, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@TicketID", ticketId);
                        cmd.Parameters.AddWithValue("@AdminID", adminId);
                        cmd.Parameters.AddWithValue("@Note", note);
                        cmd.ExecuteNonQuery();
                    }

                    
                    string deleteSql = "DELETE FROM ActiveTickets WHERE TicketID = @TicketID";
                
                    using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(deleteSql, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@TicketID", ticketId);
                        cmd.ExecuteNonQuery();
                    }
                    
                    transaction.Commit();
                    return Ok(new { message = "Ticket resolved and archived successfully." });
                }
                catch (Exception ex)
                {
                    transaction.Rollback(); // Undo everything if any part fails
                    return StatusCode(500, new { error = "Resolution failed: " + ex.Message });
                }
            }
        }

        [HttpGet("all")]
        public IActionResult GetAllTickets()
        {
            try
            {
                // Sort by priorityWeight
                string sql = "SELECT TicketID, Description, Category, Status FROM ActiveTickets ORDER BY PriorityWeight DESC";
                
                var dataTable = _dbHelper.ExecuteSelectQuery(sql);

                
                var ticketList = new System.Collections.Generic.List<TicketResponse>();

                foreach (System.Data.DataRow row in dataTable.Rows)
                {
                    ticketList.Add(new TicketResponse
                    {
                        TicketID = System.Convert.ToInt32(row["TicketID"]),
                        Description = row["Description"].ToString(),
                        Category = row["Category"].ToString(),
                        Status = row["Status"].ToString()
                    });
                }

                return Ok(ticketList);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch admin queue: " + ex.Message });
            }
        }
                
    }
    
}