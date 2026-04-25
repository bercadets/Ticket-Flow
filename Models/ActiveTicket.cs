using System.ComponentModel.DataAnnotations;

namespace TicketFlowAPI.Models
{
    public class ActiveTicket
    {
        public int TicketID { get; set; }
        public int SubmitterID { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        [Required]
        public string Location { get; set; }
        
        // Make these optional - AI will set them
        public string? Category { get; set; } 
        public string? PriorityLevel { get; set; }
        
        public int PriorityWeight { get; set; } 
        public string? Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}