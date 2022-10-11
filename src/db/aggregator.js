const db = client.db("aggregation");
const coll = db.collection("teachers");

const pipeline = [
  [
    {
      $sort: {
        favCount: -1,
      },
    },
  ],
];

const aggCursor = client.db("test").coll.aggregate(pipeline);

async function printMostFavourite(client, num) {}
