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
        private readonly PredictionService _predictionService;

        public TicketsController(PredictionService predictionService)
        {
            _predictionService = predictionService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitTicket([FromBody] ActiveTicket incomingTicket)
        {
            
            var prediction = await _predictionService.PredictTicketAsync(incomingTicket.Description);

            if (prediction == null)
            {
                return StatusCode(503, new { 
                    error = "AI Analysis is currently busy. Please try again in a few moments to ensure your ticket is prioritized correctly." 
                });
            }

            try
            {

                string sql = $@"
                    INSERT INTO ActiveTickets (SubmitterID, Description, Category, PriorityLevel, PriorityWeight) 
                    VALUES ({incomingTicket.SubmitterID}, '{incomingTicket.Description}', 
                            '{prediction.Value.Category}', '{prediction.Value.Label}', {prediction.Value.Weight})";

                _dbHelper.ExecuteModifyQuery(sql);

                return Ok(new { 
                    message = "Ticket successfully analyzed and submitted!",
                    ai_routing = prediction.Value.Category,
                    priority = prediction.Value.Label
                });
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

                // 2. Use our helper to get the data as a Table
                var dataTable = _dbHelper.ExecuteSelectQuery(sql);

                // 3. Convert the table into a list of objects that the website can understand
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
                    
                    string copySql = $@"
                        INSERT INTO TicketArchive (TicketID, SubmitterID, Description, Category, FinalPriority, CreatedAt)
                        SELECT TicketID, SubmitterID, Description, Category, PriorityLevel, CreatedAt 
                        FROM ActiveTickets WHERE TicketID = {ticketId}";
                    
                    using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(copySql, connection, transaction))
                        cmd.ExecuteNonQuery();

                    
                    string noteSql = $@"
                        INSERT INTO ResolutionNotes (TicketID, AdminID, NoteText) 
                        VALUES ({ticketId}, {adminId}, '{note}')";
                    
                    using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(noteSql, connection, transaction))
                        cmd.ExecuteNonQuery();

                    
                    string deleteSql = $"DELETE FROM ActiveTickets WHERE TicketID = {ticketId}";
                    
                    using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(deleteSql, connection, transaction))
                        cmd.ExecuteNonQuery();

                    
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
        [HttpPost("test-ai")]
        public async Task<IActionResult> TestAI([FromBody] string description)
        {
            var prediction = await _predictionService.PredictTicketAsync(description);

            if (prediction == null)
                return StatusCode(503, new { error = "AI returned null - check your API key or prompt." });

            return Ok(new {
                raw_category = prediction.Value.Category,
                raw_weight = prediction.Value.Weight,
                raw_label = prediction.Value.Label
            });
        }
    }
    
}