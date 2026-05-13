using System.ComponentModel.DataAnnotations;

namespace TicketFlowAPI.Models
{
    public class PasswordReset
    {
        [Required, MaxLength(100)]
        public string FName { get; set; }
        [Required, MaxLength(100)]
        public string LName { get; set; }
        [Required, MaxLength(50)]
        public string Username { get; set; }
        [Required, MaxLength(20)]
        public string NewPassword { get; set; }
    }
}