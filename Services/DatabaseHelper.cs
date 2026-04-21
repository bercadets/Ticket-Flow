using System.Data;
using MySql.Data.MySqlClient;

namespace TicketFlowAPI.Services
{
    public class DatabaseHelper
    {
       
        private readonly string connectionString = "Server=localhost; Database=SmartTicketingDB; Uid=root; Pwd=;";
        
        public MySqlConnection GetConnection()
        {
            return new MySqlConnection(connectionString);
        }
        public DataTable ExecuteSelectQuery(string query)
        {
            DataTable dataTable = new DataTable();
            using (MySqlConnection conn = GetConnection())
            {
                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    conn.Open();
                    using (MySqlDataAdapter adapter = new MySqlDataAdapter(cmd))
                    {
                        adapter.Fill(dataTable);
                    }
                }
            }
            return dataTable;
        }

        public int ExecuteModifyQuery(string query, Dictionary<string, object> parameters = null)
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

            // 1. Create the Users Table
            string createUsersTable = @"
                CREATE TABLE IF NOT EXISTS `Users` (
                `UserID` int(11) NOT NULL,
                `FName` varchar(100) NOT NULL,
                `LName` varchar(100) NOT NULL,
                `Username` varchar(50) NOT NULL,
                `PasswordHash` varchar(255) NOT NULL,
                `Role` varchar(20) NOT NULL CHECK (`Role` in ('Student','Admin'))
                );";

            // 2. Create the Active Tickets Table (With the Foreign Key!)
            string createTicketsTable = @"
                CREATE TABLE IF NOT EXISTS `ActiveTickets` (
                `TicketID` int(11) NOT NULL,
                 `SubmitterID` int(11) NOT NULL,
                    `Description` text NOT NULL,
                    `Location` varchar(255) DEFAULT NULL,
                    `Category` varchar(50) NOT NULL,
                    `PriorityLevel` varchar(20) NOT NULL,
                    `PriorityWeight` int(11) NOT NULL,
                    `Status` varchar(20) DEFAULT 'Open' CHECK (`Status` in ('Open','In Progress')),
                    `CreatedAt` datetime DEFAULT current_timestamp()
                );";


            string createArchiveTable = @"
                CREATE TABLE IF NOT EXISTS `TicketArchive` (
                `TicketID` int(11) NOT NULL,
                `SubmitterID` int(11) NOT NULL,
                `Description` text NOT NULL,
                `Location` varchar(255) DEFAULT NULL,
                `Category` varchar(50) NOT NULL,
                `FinalPriority` varchar(20) NOT NULL,
                `CreatedAt` datetime NOT NULL,
                `ResolvedAt` datetime DEFAULT current_timestamp()
                );";

                string createNotesTable = @"
                CREATE TABLE IF NOT EXISTS `resolutionnotes` (
                    `NoteID` int(11) NOT NULL,
                    `TicketID` int(11) NOT NULL,
                    `AdminID` int(11) NOT NULL,
                    `NoteText` text NOT NULL,
                    `Timestamp` datetime DEFAULT current_timestamp()
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
    }
}