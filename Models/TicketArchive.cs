namespace TicketFlowAPI.Models
{
    public class TicketArchive
    {
        public int TicketID { get; set; }
        public int SubmitterID { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; 
        public string FinalPriority { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ResolvedAt { get; set; } = DateTime.UtcNow;

    }
}