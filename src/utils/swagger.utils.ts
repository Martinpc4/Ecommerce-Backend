// ! Imports
// * Modules
import swaggerUi from 'swagger-ui-express';
// * Utils
import env from './env.utils';

// ! Swagger data definition
const swaggerData: swaggerUi.SwaggerOptions = {
    "openapi": "3.0.0",
    "info": {
        "description": "",
        "version": "1.8.3",
        "title": "Ecommerce-Backend API",
        "contact": {
            "email": "perezcobomartin4@hotmail.com"
        },
        "license": {
            "name": "Apache License 2.0",
            "url": "https://www.apache.org/licenses/LICENSE-2.0"
        }
    },
    "externalDocs": {
        "description": "Access the server source code",
        "url": "https://github.com/martinpc4/ecommerce-backend"
    },
    "servers": [
        {
            "url": env.BACKEND_URL
        }
    ],
    "tags": [
        {
            "name": "Products",
            "description": "Everything on products"
        },
        {
            "name": "Carts",
            "description": "Operations about user's cart"
        },
        {
            "name": "Users",
            "description": "Access to user data"
        },
        {
            "name": "Auth",
            "description": "Authenticate the user"
        }
    ],
    "paths": {
        "/api/products": {
            "get": {
                "tags": [
                    "Products"
                ],
                "summary": "Get all products",
                "responses": {
                    "200": {
                        "description": "Products retrieved correctly",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/Product"
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, products not retrieved",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": [
                    "Products"
                ],
                "summary": "Add a new product",
                "requestBody": {
                    "description": " These properties correspond to the new product properties. Take into consideration that the \"_id\" property will not be included here as the server will response with the product properties from the saved product where the \"_id\" property will be included.",
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Product"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Product added correctly",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/Product"
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Error adding product, no correlation between stock and colors",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, product not added",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/products/{productId}": {
            "put": {
                "parameters": [
                    {
                        "in": "path",
                        "name": "productId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ObjectId corresponding to the desired Product"
                    }
                ],
                "requestBody": {
                    "description": "The new product properties. Take into consideration that all properties sent, will be verified and later set as the new product passed by the product Id parameter",
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Product"
                            }
                        }
                    }
                },
                "tags": [
                    "Products"
                ],
                "summary": "Modify an existing product",
                "responses": {
                    "200": {
                        "description": "Product modified correctly",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Product"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "The desired product to be modified, does not exists",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, product not modified",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "parameters": [
                    {
                        "in": "path",
                        "name": "productId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ObjectId corresponding to the desired Product"
                    }
                ],
                "tags": [
                    "Products"
                ],
                "summary": "Modify an existing product",
                "responses": {
                    "200": {
                        "description": "Product deleted correctly"
                    },
                    "404": {
                        "description": "The desired product to be deleted, does not exists",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, product not deleted",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/products/category/{categoryId}": {
            "get": {
                "tags": [
                    "Products"
                ],
                "parameters": [
                    {
                        "in": "path",
                        "name": "categoryId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ObjectId corresponding to the desired category of products"
                    }
                ],
                "summary": "Get all products from a specific category",
                "responses": {
                    "200": {
                        "description": "Products from a specific category retrieved correctly",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/Product"
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Invalid category id",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, products from a specific category not retrieved",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/carts": {
            "post": {
                "tags": [
                    "Carts"
                ],
                "summary": "Create a new cart for an user",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "requestBody": {
                    "description": "These properties correspond to the product to be added to the user's cart. Take into consideration that every product sent have to match the CartProduct schema and that every one are verified",
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CartProduct"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Cart was successfully created",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "No products were sent",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "406": {
                        "description": "User does not exists or already has a cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, user's cart could not be created",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "tags": [
                    "Carts"
                ],
                "summary": "Delete the user's cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Cart was successfully deleted",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "The cart from the user was not found",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "406": {
                        "description": "User does not exists or already has a cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, user's cart could not be deleted",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/carts/products": {
            "get": {
                "tags": [
                    "Carts"
                ],
                "summary": "Get all products from the user's cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Products retrieved successfully",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/CartProduct"
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "The cart from the user was not found",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, products from user's cart could not be retrieved",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": [
                    "Carts"
                ],
                "summary": "Add a new product to user's cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "description": "These properties correspond to the product that need to be added to the user's cart. Take into consideration that all properties will be verified and compared to the existing product in the database to prevent mistakes",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CartProduct"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Product added successfully",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/CartProduct"
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "User's cart already contains the desired product",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "User's cart could not been found or the desired product does not exist",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, product could not be added to user's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "tags": [
                    "Carts"
                ],
                "summary": "Delete all product from cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "All products has been removed from user's cart",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/CartProduct"
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "User's cart could not be found",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, products could not be removed from user's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/carts/products/{productId}": {
            "get": {
                "parameters": [
                    {
                        "in": "path",
                        "name": "productId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ObjectId corresponding to the desired Product from user's cart"
                    }
                ],
                "tags": [
                    "Carts"
                ],
                "summary": "Get a product from user's cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Product successfully retrieved from user's cart",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/CartProduct"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Product has not been found in user's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, product from user's cart could not be retrieved",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "put": {
                "parameters": [
                    {
                        "in": "path",
                        "name": "productId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ObjectId corresponding to the desired Product from user's cart"
                    }
                ],
                "tags": [
                    "Carts"
                ],
                "summary": "Modify a product from user's cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "description": "These properties correspond to the new properties from the product in user's cart. Take into consideration that all properties will be verified and compared to the existing product in the database to prevent mistakes",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CartProduct"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Product successfully modified in user's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Product sent is not valid",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "User's cart could not be found or Product does not exists in User's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, product from user's cart could not be modified",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "parameters": [
                    {
                        "in": "path",
                        "name": "productId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ObjectId corresponding to the desired Product from user's cart"
                    }
                ],
                "tags": [
                    "Carts"
                ],
                "summary": "Delete a product from user's cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "description": "These properties correspond to the existing product in user's cart that wants to be deleted. Take into consideration that all properties will be verified and compared to the existing product in the user's cart",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CartProduct"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Product has been removed from user's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Not enough information to delete product from user's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "User's cart or the desired product were not been found",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, product could not be removed from user's cart",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/carts/checkout": {
            "post": {
                "tags": [
                    "Carts"
                ],
                "summary": "Checkout user's cart",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User's cart has been checkout",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "receiptInstance": {
                                            "$ref": "#/components/schemas/Receipt"
                                        },
                                        "message": {
                                            "type": "string"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "User's cart does not have enough stock",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "User's cart does not exist, is empty or User's email is not verified",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, user's cart could not be checkout",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/users/profile": {
            "get": {
                "tags": [
                    "Users"
                ],
                "summary": "Get an user's profile",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User's profile successfully retrieved",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SecureUser"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, user's profile could not be retrieved",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/users/update/profile": {
            "put": {
                "tags": [
                    "Users"
                ],
                "summary": "Update an user's profile",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "description": "These properties correspond to the new user's properties. Take into consideration that this rout is not used for updating the user's password as it is a secure update.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/SecureUser"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "User's profile successfully updated",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SecureUser"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, user's profile could not be updated",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/users/update/password": {
            "put": {
                "tags": [
                    "Users"
                ],
                "summary": "Update an user's password",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "description": "The request body must contain the old password and the new one. Take into consideration that the old user's password will be verified before updating it.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "oldPassword": {
                                        "type": "string"
                                    },
                                    "newPassword": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "User's password successfully updated",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Incorrect user's old password",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Missing password fields",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, user's password could not be updated",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/users/verify": {
            "post": {
                "tags": [
                    "Users"
                ],
                "summary": "Verify user's email",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "description": "The request body must contain the user's email's verification code.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "verificationCode": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "User's email verified",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid verification code",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, user's email could not be verified",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/users/verification_code": {
            "post": {
                "tags": [
                    "Users"
                ],
                "summary": "Send the email's verification code",
                "security": [
                    {
                        "JWTBearerAuth": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Verification code sent",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, could not sent the user's verification code to its email",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/auth/login": {
            "post": {
                "tags": [
                    "Auth"
                ],
                "summary": "Login the user",
                "requestBody": {
                    "required": true,
                    "description": "The request body must contain the user's email and password.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "username": {
                                        "type": "string"
                                    },
                                    "password": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "User's login successful",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "token": {
                                            "type": "string"
                                        },
                                        "expiresIn": {
                                            "type": "string"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, could not authenticate the user",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/auth/signup": {
            "post": {
                "tags": [
                    "Auth"
                ],
                "summary": "Register a new user",
                "requestBody": {
                    "required": true,
                    "description": "The request body must contain the user's properties.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    },
                                    "password": {
                                        "type": "string"
                                    },
                                    "lastName": {
                                        "type": "string"
                                    },
                                    "email": {
                                        "type": "string"
                                    },
                                    "street": {
                                        "type": "string"
                                    },
                                    "streetNumber": {
                                        "type": "number"
                                    },
                                    "country": {
                                        "type": "string"
                                    },
                                    "state": {
                                        "type": "string"
                                    },
                                    "postalCode": {
                                        "type": "number"
                                    },
                                    "city": {
                                        "type": "string"
                                    },
                                    "phoneNumber": {
                                        "type": "number"
                                    },
                                    "phoneExtension": {
                                        "type": "number"
                                    }
                                },
                                "example": {
                                    "name": "John",
                                    "lastName": "Doe",
                                    "email": "test@mail.com",
                                    "password": "Password12345",
                                    "streetNumber": 123,
                                    "street": "Hipolito Yrigoyen",
                                    "postalCode": 1234,
                                    "country": "Argentina",
                                    "state": "Buenos Aires",
                                    "city": "Lanus",
                                    "phoneNumber": 12345678,
                                    "phoneExtension": 54
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "User's registration successful",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "token": {
                                            "type": "string"
                                        },
                                        "expiresIn": {
                                            "type": "string"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Information provided about the user is incomplete, the user already exists or it simply invalid",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: server could not resolve the request, could not register the user",
                        "content": {
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "components": {
        "securitySchemes": {
            "JWTBearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            }
        },
        "schemas": {
            "Product": {
                "type": "object",
                "required": [
                    "name",
                    "price",
                    "description",
                    "imagesURL",
                    "categoryId",
                    "memory",
                    "stock",
                    "colors"
                ],
                "properties": {
                    "_id": {
                        "type": "object",
                        "properties": {
                            "ObjectId": {
                                "type": "string"
                            }
                        }
                    },
                    "name": {
                        "type": "string"
                    },
                    "price": {
                        "type": "number"
                    },
                    "description": {
                        "type": "string"
                    },
                    "imagesURL": {
                        "type": "string"
                    },
                    "categoryId": {
                        "type": "number"
                    },
                    "timeStamp": {
                        "type": "string"
                    },
                    "colors": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "stock": {
                        "type": "array",
                        "items": {
                            "type": "number"
                        }
                    }
                },
                "xml": {
                    "name": "Product"
                },
                "example": {
                    "_id": {
                        "ObjectId": "61c53a825c9e5addfd340b9d"
                    },
                    "categoryId": 3,
                    "name": "IPhone 13",
                    "description": "iPhone 13. El sistema de dos cámaras más avanzado en un iPhone. El superrápido chip A15 Bionic. Un gran salto en duración de batería. Un diseño resistente. Y una pantalla Super Retina XDR más brillante.",
                    "price": 900,
                    "imagesURL": [
                        "https://http2.mlstatic.com/D_NQ_NP_619667-MLA47781882790_102021-O.jpg",
                        "https://http2.mlstatic.com/D_NQ_NP_793813-MLA47781882791_102021-O.jpg",
                        "https://http2.mlstatic.com/D_NQ_NP_681631-MLA47781864853_102021-O.jpg",
                        "https://http2.mlstatic.com/D_NQ_NP_690881-MLA47781864854_102021-O.jpg"
                    ],
                    "timeStamp": "2021-12-24T03:12:02.410Z",
                    "memory": 128,
                    "stock": [
                        438,
                        200,
                        54,
                        984
                    ],
                    "colors": [
                        "(Product) Red",
                        "Midnight Blue",
                        "Silver",
                        "Black"
                    ]
                }
            },
            "CartProduct": {
                "type": "object",
                "required": [
                    "_id",
                    "name",
                    "price",
                    "description",
                    "imagesURL",
                    "categoryId",
                    "memory",
                    "amount",
                    "color"
                ],
                "properties": {
                    "_id": {
                        "type": "object",
                        "properties": {
                            "ObjectId": {
                                "type": "string"
                            }
                        }
                    },
                    "name": {
                        "type": "string"
                    },
                    "price": {
                        "type": "number"
                    },
                    "description": {
                        "type": "string"
                    },
                    "imagesURL": {
                        "type": "string"
                    },
                    "categoryId": {
                        "type": "number"
                    },
                    "timeStamp": {
                        "type": "string"
                    },
                    "color": {
                        "type": "string"
                    },
                    "amount": {
                        "type": "number"
                    }
                },
                "example": {
                    "_id": {
                        "ObjectId": "61c53a825c9e5addfd340b9d"
                    },
                    "categoryId": 3,
                    "name": "IPhone 13",
                    "description": "iPhone 13. El sistema de dos cámaras más avanzado en un iPhone. El superrápido chip A15 Bionic. Un gran salto en duración de batería. Un diseño resistente. Y una pantalla Super Retina XDR más brillante.",
                    "price": 900,
                    "imagesURL": [
                        "https://http2.mlstatic.com/D_NQ_NP_619667-MLA47781882790_102021-O.jpg",
                        "https://http2.mlstatic.com/D_NQ_NP_793813-MLA47781882791_102021-O.jpg",
                        "https://http2.mlstatic.com/D_NQ_NP_681631-MLA47781864853_102021-O.jpg",
                        "https://http2.mlstatic.com/D_NQ_NP_690881-MLA47781864854_102021-O.jpg"
                    ],
                    "timeStamp": "2021-12-24T03:12:02.410Z",
                    "memory": 128,
                    "amount": 1,
                    "color": "(Product) Red"
                },
                "xml": {
                    "name": "Cart Product"
                }
            },
            "Receipt": {
                "type": "object",
                "required": [
                    "_id",
                    "cartId",
                    "userId",
                    "total",
                    "timeStamp"
                ],
                "properties": {
                    "_id": {
                        "type": "object",
                        "properties": {
                            "ObjectId": {
                                "type": "string"
                            }
                        }
                    },
                    "cartId": {
                        "type": "object",
                        "properties": {
                            "ObjectId": {
                                "type": "string"
                            }
                        }
                    },
                    "userId": {
                        "type": "object",
                        "properties": {
                            "ObjectId": {
                                "type": "string"
                            }
                        }
                    },
                    "total": {
                        "type": "number"
                    },
                    "timeStamp": {
                        "type": "string"
                    }
                },
                "example": {
                    "_id": {
                        "ObjectId": "61c53a825c9e5addfd340b9d"
                    },
                    "userId": {
                        "ObjectId": "61c53a825c9e5addfd340b9d"
                    },
                    "cartId": {
                        "ObjectId": "61c53a825c9e5addfd340b9d"
                    },
                    "total": 1000,
                    "timeStamp": "2021-12-24T03:12:02.410Z"
                },
                "xml": {
                    "name": "Receipt"
                }
            },
            "SecureUser": {
                "type": "object",
                "required": [
                    "name",
                    "lastName",
                    "email",
                    "cartId",
                    "address",
                    "phoneNumber",
                    "linkedAccounts"
                ],
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "_id": {
                        "type": "object",
                        "properties": {
                            "ObjectId": {
                                "type": "string"
                            }
                        }
                    },
                    "lastName": {
                        "type": "string"
                    },
                    "timeStamp": {
                        "type": "string"
                    },
                    "email": {
                        "type": "object",
                        "properties": {
                            "email": {
                                "type": "string"
                            },
                            "verified": {
                                "type": "boolean"
                            },
                            "verification_code": {
                                "type": "object",
                                "properties": {
                                    "ObjectId": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    },
                    "cartId": {
                        "type": "object",
                        "properties": {
                            "ObjectId": {
                                "type": "string"
                            }
                        }
                    },
                    "address": {
                        "type": "object",
                        "properties": {
                            "street": {
                                "type": "string"
                            },
                            "streetNumber": {
                                "type": "number"
                            },
                            "country": {
                                "type": "string"
                            },
                            "state": {
                                "type": "string"
                            },
                            "postalCode": {
                                "type": "number"
                            },
                            "city": {
                                "type": "string"
                            }
                        }
                    },
                    "phoneNumber": {
                        "type": "object",
                        "properties": {
                            "number": {
                                "type": "number"
                            },
                            "extension": {
                                "type": "number"
                            }
                        }
                    },
                    "linkedAccounts": {
                        "type": "object",
                        "properties": {
                            "github": {
                                "type": "string",
                                "nullable": true
                            },
                            "facebook": {
                                "type": "string",
                                "nullable": true
                            }
                        }
                    }
                },
                "example": {
                    "_id": {
                        "ObjectId": "61c53a825c9e5addfd340b9d"
                    },
                    "name": "John",
                    "lastName": "Doe",
                    "timeStamp": "2021-12-24T03:12:02.410Z",
                    "email": {
                        "email": "test@mail.com",
                        "verified": false,
                        "verification_code": {
                            "ObjectId": "61c53a825c9e5addfd340b9d"
                        }
                    },
                    "cartId": {
                        "ObjectId": "61c53a825c9e5addfd340b9d"
                    },
                    "address": {
                        "streetNumber": 123,
                        "street": "Hipolito Yrigoyen",
                        "postalCode": 1234,
                        "country": "Argentina",
                        "state": "Buenos Aires",
                        "city": "Lanus"
                    },
                    "phoneNumber": {
                        "number": 12345678,
                        "extension": 54
                    },
                    "linkedAccounts": {
                        "github": null,
                        "facebook": null
                    }
                },
                "xml": {
                    "name": "User"
                }
            }
        }
    }
}

// ! Exports
export default swaggerData;