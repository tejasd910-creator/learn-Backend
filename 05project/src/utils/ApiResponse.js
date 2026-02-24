class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400        // statusCode ka proper rangehoti hai each response ki here reandomly less than 400 liya hai
    }
}