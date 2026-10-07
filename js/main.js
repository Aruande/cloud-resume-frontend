const visitorCount = document.getElementById("visitor-count");

fetch("https://vtmhf3exnh.execute-api.us-east-2.amazonaws.com/visitor-count", {
    method: "POST"
})
    .then(response => response.json())
    .then(data => {
        visitorCount.textContent = data.count;
    })
    .catch(error => {
        console.error("Error fetching visitor count:", error);
        visitorCount.textContent = "—";
    });