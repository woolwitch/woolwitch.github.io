exports.handler = async (event, context) => {
  console.log('Function called:', event.httpMethod, event.path);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      message: 'Hello from Netlify function!',
      timestamp: new Date().toISOString(),
      event: {
        httpMethod: event.httpMethod,
        path: event.path,
        query: event.queryStringParameters
      }
    })
  };
};