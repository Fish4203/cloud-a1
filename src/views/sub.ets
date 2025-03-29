<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/styles/main.css">
  <title>Subscription</title>
</head>
<body>
  <h1>Subscriptions</h1>

  <table>
    <thead>
      <tr>
        <th scope="col">Title</th>
        <th scope="col">Artist</th>
        <th scope="col">Year</th>
        <th scope="col">Album</th>
        <th scope="col">Image</th>
        <th scope="col">UnSubscribe</th>
      </tr>
    </thead>
    <tbody>
      <% for ( const sub of subs ) { %>
        <tr>
          <th scope="row"><%= sub. %> </th>
        </tr>
      <% } %>
    </tbody>
  </table>
  <% if (formError) { %>
    <p><%= formError %> </p>
  <% } %>

</body>
</html>
