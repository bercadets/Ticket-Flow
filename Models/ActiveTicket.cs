using System;

namespace TicketFlowAPI.Models
{
    public class ActiveTicket
    {
        public int TicketID { get; set; }
        public int SubmitterID { get; set; }
        public string Description { get; set; }
        public string Category { get; set; } 
        public string PriorityLevel { get; set; }
        public int PriorityWeight { get; set; } 
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}