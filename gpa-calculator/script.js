document.addEventListener("DOMContentLoaded", () => {

    document.addEventListener("click", function (e) {
        if (e.target && e.target.matches(".btn.btn-dark.mb-2")) {
            const groupDiv = e.target.closest(".bg-light");
            const tbody = groupDiv.querySelector("tbody");
            const rowCount = tbody.children.length + 1;

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <th scope="row">${rowCount}</th>
                <td><input type="text" class="form-control" aria-label="Name"></td>
                <td><input type="number" class="form-control" aria-label="Points"></td>
                <td><input type="number" class="form-control" aria-label="Out of"></td>
            `;

            tbody.appendChild(newRow);
        }
    });

    document.querySelector(".btn.btn-light.me-3").addEventListener("click", () => {
        const firstGroup = document.querySelector(".bg-light");
        const newGroup = firstGroup.cloneNode(true);

        newGroup.querySelector("input[aria-label='Weight']").value = "";
        newGroup.querySelector("tbody").innerHTML = `
            <tr>
                <th scope="row">1</th>
                <td><input type="text" class="form-control" aria-label="Name"></td>
                <td><input type="number" class="form-control" aria-label="Points"></td>
                <td><input type="number" class="form-control" aria-label="Out of"></td>
            </tr>
        `;

        firstGroup.parentNode.insertBefore(newGroup, firstGroup.nextSibling);
    });

    // Calculate
    document.querySelector(".btn.btn-primary").addEventListener("click", () => {
        const groups = document.querySelectorAll(".bg-light");

        let finalGrade = 0;

        groups.forEach(group => {
            const weightInput = group.querySelector("input[aria-label='Weight']");
            const weight = parseFloat(weightInput.value) || 0;

            const rows = group.querySelectorAll("tbody tr");
            let totalEarned = 0;
            let totalPossible = 0;

            rows.forEach(row => {
                const pts = parseFloat(row.querySelector("input[aria-label='Points']").value) || 0;
                const outOf = parseFloat(row.querySelector("input[aria-label='Out of']").value) || 0;

                totalEarned += pts;
                totalPossible += outOf;
            });

            if (totalPossible > 0) {
                const groupPercent = totalEarned / totalPossible;
                finalGrade += groupPercent * (weight / 100);
            }
        });

        alert("Your final weighted grade is: " + (finalGrade * 100).toFixed(2) + "%");
    });

});

