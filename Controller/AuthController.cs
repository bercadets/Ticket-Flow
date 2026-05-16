using Microsoft.AspNetCore.Mvc;
using TicketFlowAPI.Models;
using TicketFlowAPI.Services;
using System.Data;
using Microsoft.AspNetCore.Authorization;
namespace TicketFlowAPI.Controllers

{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper;
        private readonly IConfiguration _configuration;

        public AuthController(DatabaseHelper dbHelper, IConfiguration configuration)
        {
            _dbHelper = dbHelper;
            _configuration = configuration;
        }

        private string GenerateJwtToken(string username, string role)
        {
            var key = System.Text.Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
                    var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                    
                    var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
                    {
                        Subject = new System.Security.Claims.ClaimsIdentity(new[]
                        {

                            new System.Security.Claims.Claim("id", username),
                            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role)
                        }),
                        Expires = System.DateTime.UtcNow.AddHours(2),
                        SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
                            new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
                            Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
                    };

                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    return tokenHandler.WriteToken(token);

        }

    [AllowAnonymous]
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest newUser)
    {
        try
        {
        
            string checkUserSql = "SELECT UserID FROM Users WHERE Username = @Username";
            var parametersUser = new Dictionary<string, object> { { "@Username", newUser.Username } };
            var existingUser = _dbHelper.ExecuteSelectQuery(checkUserSql, parametersUser);

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
            string tokenString = GenerateJwtToken(newUser.Username, "Student");

            _dbHelper.ExecuteModifyQuery(insertSql, parameters);

            
            return Ok(new { message = "Registration successful! You can now log in." , token = tokenString});
        }
        catch (System.Exception ex)
        {
            System.Console.WriteLine($"CRITICAL DB ERROR: {ex.Message}");
            return StatusCode(500, new { error = "An unexpected error occurred while processing your request. Please try again later." });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest login)
        {
            try
            {
                
                
                string sql = $@"SELECT UserID, FName, LName, Role, PasswordHash 
                                FROM Users 
                                WHERE Username = @Username";
                var parameters = new Dictionary<string, object> { { "@Username", login.Username } };

                DataTable result = _dbHelper.ExecuteSelectQuery(sql, parameters);

                
                if (result.Rows.Count == 1)
                {
                    var row = result.Rows[0];
                    string? storedDatabaseHash = row["PasswordHash"].ToString();

                    bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(login.Password, storedDatabaseHash);
                    if (isPasswordCorrect)
                    {
                        string tokenString = GenerateJwtToken(login.Username, row["Role"].ToString()!);
                        return Ok(new {
                            UserId = row["UserID"],
                            FName = row["FName"],
                            LName = row["LName"],
                            Role = row["Role"],
                            Token = tokenString,
                            Message = "Login successful!"
                        });
                    }
                }

            
                return Unauthorized(new { message = "Invalid username or password." });
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"CRITICAL DB ERROR: {ex.Message}");
            return StatusCode(500, new { error = "An unexpected error occurred while processing your request. Please try again later." });
            }
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
            public IActionResult ResetPassword([FromBody] PasswordReset request)
            {
                try
                {
                string checkSql = "SELECT UserID FROM Users WHERE FName = @FName AND LName = @LName AND Username = @Username";
                    
                    var checkParams = new System.Collections.Generic.Dictionary<string, object>
                    {
                        { "@FName", request.FName },
                        { "@LName", request.LName },
                        { "@Username", request.Username }
                    };

                    var resultTable = _dbHelper.ExecuteSelectQuery(checkSql, checkParams);

                    if (resultTable.Rows.Count == 0)
                    {
                     
                        return BadRequest(new { error = "Account not found or details do not match." });
                    }

                    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                    
                    string updateSql = "UPDATE Users SET PasswordHash = @NewPassword WHERE Username = @Username";
                    var updateParams = new System.Collections.Generic.Dictionary<string, object>
                    {
                        { "@NewPassword", hashedPassword },
                        { "@Username", request.Username }
                    };

                    _dbHelper.ExecuteNonQuery(updateSql, updateParams);

                    return Ok(new { message = "Password successfully reset! You can now log in." });
                }
                catch (System.Exception ex)
                {
                    System.Console.WriteLine($"CRITICAL DB ERROR: {ex.Message}");
            return StatusCode(500, new { error = "An unexpected error occurred while processing your request. Please try again later." });
                }
            }
    }
}