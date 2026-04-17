namespace TicketFlowAPI.Models
{
    public class TicketArchive
    {
        public int TicketID { get; set; }
        public int SubmitterID { get; set; }
        public string Description { get; set; }
        public string Category { get; set; } 
        public string FinalPriority { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ResolvedAt { get; set; } = DateTime.UtcNow;

    }
}