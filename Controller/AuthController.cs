using Microsoft.AspNetCore.Mvc;
using TicketFlowAPI.Models;
using TicketFlowAPI.Services;
using System.Data;

namespace TicketFlowAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper = new DatabaseHelper();

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest newUser)
    {
        try
        {
        
            string checkUserSql = $"SELECT UserID FROM Users WHERE Username = '{newUser.Username}'";
            var existingUser = _dbHelper.ExecuteSelectQuery(checkUserSql);

            if (existingUser.Rows.Count > 0)
            {
                return BadRequest(new { message = "That username is already taken. Please choose another." });
            }

           
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newUser.Password);

            
            string insertSql = @"
                INSERT INTO Users (FName, LName, Username, PasswordHash, Role) 
                VALUES (@FName, @LName, @Username, @PasswordHash, 'Student')";
                var parameters = new System.Collections.Generic.Dictionary<string, object>
                {
                    { "@FName", newUser.FName },
                    { "@LName", newUser.LName },
                    { "@Username", newUser.Username },
                    { "@PasswordHash", hashedPassword }
                };


            _dbHelper.ExecuteModifyQuery(insertSql, parameters);

            
            return Ok(new { message = "Registration successful! You can now log in." });
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, new { error = "Registration failed: " + ex.Message });
        }
    }

    [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest login)
        {
            try
            {
                
                string sql = $@"SELECT UserID, FName, LName, Role, PasswordHash 
                                FROM Users 
                                WHERE Username = '{login.Username}'";

                DataTable result = _dbHelper.ExecuteSelectQuery(sql);

                
                if (result.Rows.Count == 1)
                {
                    var row = result.Rows[0];
                    string storedDatabaseHash = row["PasswordHash"].ToString();

                
                    bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(login.Password, storedDatabaseHash);

                    if (isPasswordCorrect)
                    {

                        return Ok(new {
                            UserId = row["UserID"],
                            FName = row["FName"],
                            LName = row["LName"],
                            Role = row["Role"],
                            Message = "Login successful!"
                        });
                    }
                }

            
                return Unauthorized(new { message = "Invalid username or password." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = "Login failed: " + ex.Message });
            }
        }
    }
}