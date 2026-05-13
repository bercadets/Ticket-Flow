using System.ComponentModel.DataAnnotations;

namespace TicketFlowAPI.Models
{
    public class RegisterRequest
    {
        [Required, MaxLength(100)]
        public string FName { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string LName { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string Username { get; set; } = string.Empty;
        [Required, MaxLength(20)]
        public string Password { get; set; } = string.Empty;
    }
}