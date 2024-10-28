const express = require("express")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const cors = require("cors")
const app = express()


const corsOptions = {
  origin: 'http://localhost:3000', // allow requests only from localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // specify allowed HTTP methods
  credentials: true, // allow cookies to be sent with requests
};

app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods if needed
    credentials: true, // Enable credentials if required (e.g., cookies, headers)
}));

app.use(cors(corsOptions))


const corsOptions = {
  origin: ['http://localhost:3000', 'https://roxilerfullstack.onrender.com'], // Add your production URL here
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Define the allowed methods if necessary
  credentials: true, // Include credentials if necessary
};

app.use(cors(corsOptions));


const dbPath = path.join(__dirname,"./products.db")
let db = null 
const initializeDBAndServer = async()=>{
    try{
db = await open({
    filename:dbPath,
    driver:sqlite3.Database
})
app.listen(4000,()=>{
    console.log("Server is Running At http://localhost:4000")
})
    }catch(e){
        console.log(`DBError ${e.message}`)
        process.exit(1)
    }
}

initializeDBAndServer()

app.get("/transactions",async(request,response)=>{

    const {page =1, per_page =10,search = ""} = request.query;
    const offSet = (page-1)*per_page
    const quary = `SELECT * FROM products 
    WHERE title LIKE '%${search}%' OR description LIKE '%${search}%' OR price LIKE '%${search}%'
    LIMIT ${per_page}
    OFFSET ${offSet}`; 
    
    const result = await db.all(quary)
    response.send(result)
    
  
    
 })

 // GET API statistics
app.get("/statistics",async(request,response)=>{
    let {month = 5} = request.query
    month = parseInt(month)

    const quary = `SELECT 
   SUM(CASE WHEN sold = 1 THEN price ELSE 0 END) as total_sales,
   COUNT(CASE WHEN sold = 1 THEN 1 END) as sold_items,
   COUNT(CASE WHEN sold = 0 THEN 1 END) as unsold_items
   FROM products 
   WHERE CAST(strftime("%m",dateOfSale) AS INTEGER) = ${month}`

   const results = await db.get(quary)
   response.send(results)

   
})
// GET API BAR_CHAT
app.get('/barchart/:month',async (request, response) => {
    let {month =5} = request.params
    month = parseInt(month)
  
    // SQL query to calculate the number of items in each price range
    const sql = `
      SELECT 
        COUNT(CASE WHEN price BETWEEN 0 AND 100 THEN 1 END) AS range_0_100,
        COUNT(CASE WHEN price BETWEEN 101 AND 200 THEN 1 END) AS range_101_200,
        COUNT(CASE WHEN price BETWEEN 201 AND 300 THEN 1 END) AS range_201_300,
        COUNT(CASE WHEN price BETWEEN 301 AND 400 THEN 1 END) AS range_301_400,
        COUNT(CASE WHEN price BETWEEN 401 AND 500 THEN 1 END) AS range_401_500,
        COUNT(CASE WHEN price BETWEEN 501 AND 600 THEN 1 END) AS range_501_600,
        COUNT(CASE WHEN price BETWEEN 601 AND 700 THEN 1 END) AS range_601_700,
        COUNT(CASE WHEN price BETWEEN 701 AND 800 THEN 1 END) AS range_701_800,
        COUNT(CASE WHEN price BETWEEN 801 AND 900 THEN 1 END) AS range_801_900,
        COUNT(CASE WHEN price > 900 THEN 1 END) AS range_901_above
      FROM products
      WHERE CAST(strftime("%m",dateOfSale)As INTEGER) = ${month}
    `;
  
    const data = await db.get(sql)

    response.send({
        range_0_100: data.range_0_100 ,
        range_101_200: data.range_101_200 ,
        range_201_300: data.range_201_300 ,
        range_301_400: data.range_301_400 ,
        range_401_500: data.range_401_500 ,
        range_501_600: data.range_501_600 ,
        range_601_700: data.range_601_700 ,
        range_701_800: data.range_701_800 ,
        range_801_900: data.range_801_900 ,
        range_901_above: data.range_901_above
      });
  });
  
  // GET PIE CHART API 
  app.get("/piechart/:month",async(request,response)=>{
    let {month =5} = request.params
     month = parseInt(month)

    const slqQuary =`SELECT  category, COUNT(*) AS number_of_items
    FROM products 
    WHERE CAST(strftime("%m",dateOfSale)AS INTEGER) = ${month} 
    GROUP BY category`

    const result = await db.get(slqQuary)
    response.send(result)
  })

// GET API COMBINE
app.get("/combine/:month", async(request,response)=>{
    let {month} = request.params
    month = parseInt(month)
  const statisticsQuary = `SELECT 
   SUM(CASE WHEN sold = 1 THEN price ELSE 0 END) as total_sales,
   COUNT(CASE WHEN sold = 1 THEN 1 END) as sold_items,
   COUNT(CASE WHEN sold = 0 THEN 1 END) as unsold_items
   FROM products 
   WHERE CAST(strftime("%m",dateOfSale) AS INTEGER) = ${month}`
   const statisticsResult = await db.get(statisticsQuary)

   const barChartQuary =  `
   SELECT 
     COUNT(CASE WHEN price BETWEEN 0 AND 100 THEN 1 END) AS range_0_100,
     COUNT(CASE WHEN price BETWEEN 101 AND 200 THEN 1 END) AS range_101_200,
     COUNT(CASE WHEN price BETWEEN 201 AND 300 THEN 1 END) AS range_201_300,
     COUNT(CASE WHEN price BETWEEN 301 AND 400 THEN 1 END) AS range_301_400,
     COUNT(CASE WHEN price BETWEEN 401 AND 500 THEN 1 END) AS range_401_500,
     COUNT(CASE WHEN price BETWEEN 501 AND 600 THEN 1 END) AS range_501_600,
     COUNT(CASE WHEN price BETWEEN 601 AND 700 THEN 1 END) AS range_601_700,
     COUNT(CASE WHEN price BETWEEN 701 AND 800 THEN 1 END) AS range_701_800,
     COUNT(CASE WHEN price BETWEEN 801 AND 900 THEN 1 END) AS range_801_900,
     COUNT(CASE WHEN price > 900 THEN 1 END) AS range_901_above
   FROM products
   WHERE CAST(strftime("%m",dateOfSale)As INTEGER) = ${month}
 `;
 const barChartResult = await db.get(barChartQuary)
 
 const pieChartQuary =`SELECT  category, COUNT(*) AS number_of_items
 FROM products 
 WHERE CAST(strftime("%m",dateOfSale)AS INTEGER) = ${month} 
 GROUP BY category`
 const pieChartResult = await db.get(pieChartQuary)
 response.send({statistics:statisticsResult,barChart:barChartResult,pieChart:pieChartResult})
})
