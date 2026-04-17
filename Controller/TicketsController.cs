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
                // Hardcoded for testing. Later, this is where ML.NET goes!
                string predictedCategory = "Hardware"; 
                int priorityWeight = 3;

                string sql = $@"
                    INSERT INTO ActiveTickets (SubmitterID, Description, Category, PriorityLevel, PriorityWeight) 
                    VALUES ({incomingTicket.SubmitterID}, '{incomingTicket.Description}', '{predictedCategory}', 'Standard', {priorityWeight})";

                _dbHelper.ExecuteModifyQuery(sql);

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
        
    }
    
}