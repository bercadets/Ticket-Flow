using System.Data;
using MySql.Data.MySqlClient;

namespace TicketFlowAPI.Services
{
    public class DatabaseHelper
    {
       
        private readonly string connectionString = string.Empty;
        
        public DatabaseHelper(IConfiguration configuration)
            {
                connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
            }
        public MySqlConnection GetConnection()
        {
            return new MySqlConnection(connectionString);
        }
        public DataTable ExecuteSelectQuery(string sql, Dictionary<string, object>? parameters = null)
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    using (var command = new MySqlCommand(sql, connection))
                    {
                        if (parameters != null)
                        {
                            foreach (var param in parameters)
                            {
                                command.Parameters.AddWithValue(param.Key, param.Value);
                            }
                        }
                        var dataTable = new DataTable();
                        using (var adapter = new MySqlDataAdapter(command))
                        {
                            adapter.Fill(dataTable);
                        }
                        return dataTable;
                    }
                }
            }

        public int ExecuteModifyQuery(string query, Dictionary<string, object>? parameters = null)
        {
            using (MySqlConnection conn = GetConnection())
            {
                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    if (parameters != null)
                    {
                        foreach (var param in parameters)
                        {
                            cmd.Parameters.AddWithValue(param.Key, param.Value);
                        }
                    }

                    conn.Open();
                    return cmd.ExecuteNonQuery(); 
                }
            }
        }

        public void InitializeDatabase()
    {
        using (var connection = GetConnection())
        {
            connection.Open();

            string createUsersTable = @"
                CREATE TABLE IF NOT EXISTS `Users` (
                `UserID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `FName` varchar(100) NOT NULL,
                `LName` varchar(100) NOT NULL,
                `Username` varchar(50) NOT NULL UNIQUE,
                `PasswordHash` varchar(255) NOT NULL,
                `Role` varchar(20) NOT NULL CHECK (`Role` in ('Student','Admin'))
                );";


            string createTicketsTable = @"
                CREATE TABLE IF NOT EXISTS `ActiveTickets` (
                `TicketID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                 `SubmitterID` int(11) NOT NULL,
                    `Description` text NOT NULL,
                    `Location` varchar(255) DEFAULT NULL,
                    `Category` varchar(50) NOT NULL,
                    `PriorityLevel` varchar(20) NOT NULL,
                    `PriorityWeight` int(11) NOT NULL,
                    `Status` varchar(20) DEFAULT 'Open' CHECK (`Status` in ('Open','In Progress','Resolved')),
                    `CreatedAt` datetime DEFAULT current_timestamp(),
                    FOREIGN KEY (`SubmitterID`) REFERENCES `Users`(`UserID`) ON DELETE CASCADE
                );";


            string createArchiveTable = @"
                CREATE TABLE IF NOT EXISTS `TicketArchive` (
                `ArchiveID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `TicketID` int(11) NOT NULL,
                `SubmitterID` int(11) NOT NULL,
                `Description` text NOT NULL,
                `Location` varchar(255) DEFAULT NULL,
                `Category` varchar(50) NOT NULL,
                `FinalPriority` varchar(20) NOT NULL,
                `CreatedAt` datetime NOT NULL,
                `ResolvedAt` datetime DEFAULT current_timestamp(),
                FOREIGN KEY (`SubmitterID`) REFERENCES `Users`(`UserID`) ON DELETE CASCADE
                );";

                string createNotesTable = @"
                CREATE TABLE IF NOT EXISTS `resolutionnotes` (
                    `NoteID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    `TicketID` int(11) NOT NULL,
                    `AdminID` int(11) NOT NULL,
                    `NoteText` text NOT NULL,
                    `Timestamp` datetime DEFAULT current_timestamp(),
                    FOREIGN KEY (`TicketID`) REFERENCES `ActiveTickets`(`TicketID`) ON DELETE CASCADE,
                    FOREIGN KEY (`AdminID`) REFERENCES `Users`(`UserID`) ON DELETE CASCADE
                );";

        using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(createUsersTable, connection))
            cmd.ExecuteNonQuery();

        using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(createTicketsTable, connection))
            cmd.ExecuteNonQuery();

        using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(createArchiveTable, connection))
            cmd.ExecuteNonQuery();

        using (var cmd = new MySql.Data.MySqlClient.MySqlCommand(createNotesTable, connection))
            cmd.ExecuteNonQuery();
        }
    }

        public int ExecuteNonQuery(string sql, Dictionary<string, object>? parameters = null)
        {
            using (var connection = new MySqlConnection(connectionString))
            {
                using (var command = new MySqlCommand(sql, connection))
                {
                    if (parameters != null)
                    {
                        foreach (var param in parameters)
                        {
                            command.Parameters.AddWithValue(param.Key, param.Value);
                        }
                    }
                    connection.Open();
                    return command.ExecuteNonQuery();
                }
            }
        }

    }
}