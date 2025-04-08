import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB } from "../../config/db";

// 0	Disconnected	No connection to MongoDB
// 1	Connected	Connected and ready to use
// 2	Connecting	It is currently trying to connect
// 3	Disconnecting	It’s in the process of closing the connection

describe('Mongodb Integration', ()=> {
    let mongoServer: MongoMemoryServer;

    beforeAll(async ()=>{
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        console.log('uri created: ', uri)
        process.env.MONGO_URI = uri
    });

    afterAll(async ()=>{
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it('should connect to in-memory Mongodb', async ()=> {
        await connectDB();
        console.log('curr state: ', mongoose.connection.readyState)
        expect(mongoose.connection.readyState).toBe(1);
    })
    
})

describe('MongoDB Disconnection Check', () => {
    it('should be disconnected after closing connection', async () => {
      expect(mongoose.connection.readyState).toBe(0); 
    });
  });