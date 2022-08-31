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
  res.status(200).json({ success: true, data: users })
}


export default handle