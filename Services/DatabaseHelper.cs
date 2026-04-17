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
        public int ExecuteModifyQuery(string query)
        {
            using (MySqlConnection conn = GetConnection())
            {
                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    conn.Open();
                    return cmd.ExecuteNonQuery(); 
                }
            }
        }
    }
}