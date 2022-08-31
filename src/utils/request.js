
const instance = async (url, method='GET', payload={}, headersEx={}) => {
    const headers = new Headers();
    headers.append('Content-Type', "application/json");
    if(headersEx) {
        for (const [key, value] of Object.entries(headersEx)) {
            headers.append(key, value);
        }
    }

    const data =  {
        method: method,
        headers: headers,
      }
    console.log("payload:", payload);
    // if (payload && (method=='POST' || method == 'PUT')) {
    //     data.body = JSON.stringify({da:123});
    // }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(baseUrl+url,data)
    return res.json();
};

export default instance;
