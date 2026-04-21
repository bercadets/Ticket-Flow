using TicketFlowAPI.Services;
var builder = WebApplication.CreateBuilder(args);

// 1. Tell the app to use the Controllers folder we created
builder.Services.AddControllers(); 

// 2. Add the Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<DatabaseHelper>();

var app = builder.Build();

// 3. Force Swagger to run (I removed the "Development" check so it always loads for you)
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthorization();

// 4. Map the URL routes to our Controllers
app.MapControllers(); 

using (var scope = app.Services.CreateScope())
{
    var dbHelper = scope.ServiceProvider.GetRequiredService<DatabaseHelper>();
    try
    {
        // Tell it to build the tables!
        dbHelper.InitializeDatabase();
        System.Console.WriteLine("Database initialization successful! Tables are ready.");
    }
    catch (System.Exception ex)
    {
        System.Console.WriteLine($"Database initialization failed: {ex.Message}");
    }
}

app.Run();