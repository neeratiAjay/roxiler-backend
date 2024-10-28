const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./products.db")

db.serialize( async ()=>{

    const fetchedData = await fetch("https://s3.amazonaws.com/roxiler.com/product_transaction.json")
    const productsData = await fetchedData.json()

    db.run(`CREATE TABLE IF NOT EXISTS products(
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT , 
        price FLOAT,
        description TEXT, 
        category TEXT, 
        image TEXT, 
        sold INTEGER,  -- Store BOOLEAN as INTEGER
        dateOfSale DATETIME )`)
    
    const prepareDb = db.prepare(`INSERT INTO products(title,price,description,category,image,sold,dateOfSale)
        VALUES (?,?,?,?,?,?,?)`)
    productsData.forEach(product => {
        prepareDb.run(product.title,product.price,product.description,product.category,product.image,product.sold,product.dateOfSale)
    });
    prepareDb.finalize()

    //db.run(`DROP TABLE product`)

})
exports.module = db