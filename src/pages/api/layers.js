
async function handle(req, res) {
    const { method, body } = req;
    switch (method) {
      case "GET":
        await handleGet(body, res);
        break;
      default:
        res.setHeader("Allow", ["Get"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  }
  
  async function handleGet(data, res) {
    const assets = [
      {
        asset: "shirts",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
      {
        asset: "Mouth",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
      {
        asset: "Hats",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
      {
        asset: "Eyes",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
      {
        asset: "background",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
      {
        asset: "powers",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
      {
        asset: "Accessories",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
      {
        asset: "surprise",
        values: [
          "redhat.jpg",
          "bluebeanie.jpg",
          "sombrero.jpg",
          "rasberry-baret.jpg",
          "blackhat.jpg",
          "wizzardhat.jpg",
          "duncehat.jpg",
          "baseballcap.jpg",
          "beerhat.jpg",
          "rastahat.jpg",
          "helmet.jpg",
        ],
      },
    ];
    res.status(200).json({})
  }
  
  
  export default handle