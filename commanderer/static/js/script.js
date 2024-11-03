const Endpoint = Object.freeze({
  MODE_API_URL: "/mode",
  SERVER_API_URL: "/api/server",
});

function loadData(endpoint) {
  fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Failed to update configuration");
    })
    .then((data) => {
      console.log("Response from server:", data);

      if (endpoint == Endpoint.MODE_API_URL) {
        document.getElementById("enable").checked = data.enabled;
        document.getElementById("imageUrl").value = data.imageUrl;
        document.getElementById("x").value = data.posX;
        document.getElementById("y").value = data.posY;

        document.getElementById("configResult").style.display = "block";
        document.getElementById("configResult").textContent =
          "Mode configuration loaded successfully!";

        const resultImage = document.getElementById("resultImage");
        resultImage.src = data.imageUrl;

        document.getElementById("configResult").style.display = "block";
      } else if (endpoint == Endpoint.SERVER_API_URL) {
        document.getElementById("host").value = data.host;
        document.getElementById("port").value = data.port;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("configResult").style.display = "block";
      document.getElementById("configResult").textContent =
        "Failed to load configuration. Please try again.";
    });
}

function updateConfig(endpoint, body) {
  fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Failed to update configuration");
    })
    .then((data) => {
      console.log("Response from server:", data);
      if (endpoint == Endpoint.MODE_API_URL) {
        document.getElementById("configResult").style.display = "block";
        document.getElementById("configResult").textContent =
          "Configuration sent successfully!";

        const resultImage = document.getElementById("resultImage");
        resultImage.src = imageUrl;
        resultImage.style.objectPosition = `${x} ${y}`;

        document.getElementById("configResult").style.display = "block";
      }
      console.error("Error:", error);
      document.getElementById("configResult").style.display = "block";
      document.getElementById("configResult").textContent =
        "Failed to send configuration. Please try again.";
    });
}

function submitServerConfig() {
  const host = document.getElementById("host").value;
  const port = parseInt(document.getElementById("port").value, 10);

  const serverData = {
    host: host,
    port: port,
  };

  updateConfig(Endpoint.SERVER_API_URL, serverData);
}

function submitModeConfig() {
  const enable = document.getElementById("enable").checked;
  const imageUrl = document.getElementById("imageUrl").value;
  const x = parseInt(document.getElementById("x").value, 10);
  const y = parseInt(document.getElementById("y").value, 10);

  const modeData = {
    enabled: enable,
    posY: y,
    posX: x,
    imageUrl: imageUrl,
  };

  updateConfig(Endpoint.MODE_API_URL, modeData);
}

window.onload = function () {
  loadImages;
  loadData(Endpoint.MODE_API_URL);
  loadData(Endpoint.SERVER_API_URL);
};
async function loadImages() {
        try {
          const response = await fetch("/listFiles");
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          const imageList = document.getElementById("imageList");
          imageList.innerHTML = ""; // Clear existing images

          // Create a list item for each file
          const ul = document.createElement("ul");
          data.files.forEach(file => {
            const li = document.createElement("li");
            li.innerHTML = `<input type="radio" name="selectedImage" value="${file}" onchange="fillImageUrl('${file}')"> ${file}`;
            ul.appendChild(li);
          });

          imageList.appendChild(ul);
        } catch (error) {
          console.error("Error loading images:", error);
        }
      }
function fillImageUrl(fileName) {
        const imageUrlInput = document.getElementById("imageUrl");
        // Assuming the images are served from a specific URL structure
        imageUrlInput.value = `/pictures/${fileName}`; // Adjust the path as necessary
      }
function toggleImageList() {
        const imageList = document.getElementById("imageList");
        if (imageList.style.display === "none") {
            imageList.style.display = "block"; // Show the image list
        } else {
            imageList.style.display = "none"; // Hide the image list
      }
}
