    // Simple JavaScript includes
    document.addEventListener("DOMContentLoaded", function () {
      fetch("header.html")
        .then(res => res.text())
        .then(data => {
          document.getElementById("header").innerHTML = data;
        });

      fetch("footer.html")
        .then(res => res.text())
        .then(data => {
          document.getElementById("footer").innerHTML = data;
        });
    });
