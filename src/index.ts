import { QueryResolvers, Resolvers } from "./generated/graphql";

require("dotenv").config();
const fs = require("fs");
const { ApolloServer, gql } = require("apollo-server");
const mongoose = require("mongoose");

//Connect to database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error: string | undefined) => {
    throw new Error(error);
  });

//Database Model
const toDoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const ToDo = mongoose.model("ToDo", toDoSchema);

const schema = fs.readFileSync("./schema.graphqls");

//GraphQL Schemas
const typeDefs = gql`
  ${schema}
`;

const resolvers: Resolvers = {
  Query: {
    getToDo: async (_parent, args) => {
      try {
        const { toDoId } = args;
        return await ToDo.findById(toDoId);
      } catch (error) {
        throw new Error(error);
      }
    },
    getToDos: async (parent, args) => {
      try {
        return await ToDo.find();
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Mutation: {
    createToDo: async (parent, args) => {
      try {
        const { toDoInput } = args;
        return await ToDo.create(toDoInput);
      } catch (error) {
        throw new Error(error);
      }
    },
    updateToDo: async (parent, args) => {
      try {
        const { toDoId, toDoInput } = args;
        return await ToDo.findOneAndUpdate(toDoId, toDoInput, { new: true });
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteToDo: async (parent, args) => {
      try {
        const { toDoId } = args;
        return await ToDo.findByIdAndDelete(toDoId);
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteToDos: async (parent, args) => {
      try {
        return await ToDo.remove();
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }: { url: string }) => {
  console.log(`Server ready at ${url}`);
});
