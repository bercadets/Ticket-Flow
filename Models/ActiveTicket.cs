using System.ComponentModel.DataAnnotations;

namespace TicketFlowAPI.Models
{
    public class ActiveTicket
    {.
        public int TicketID { get; set; }
        public int SubmitterID { get; set; }
        
        [Required(ErrorMessage = "You must provide a description.")]
        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Location { get; set; } = string.Empty;
        
        public string? Category { get; set; } 
        public string? PriorityLevel { get; set; }
        
        public int PriorityWeight { get; set; } 
        public string? Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}