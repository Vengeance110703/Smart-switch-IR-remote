$(document).ready(() => {
    $("#switch1").change(() => {
        if ($("#switch1").prop("checked")) {
            $.post("/toggle", { id: 1, state: true })
        } else {
            $.post("/toggle", { id: 1, state: false })
        }
    })
    $("#switch2").change(() => {
        if ($("#switch2").prop("checked")) {
            $.post("/toggle", { id: 2, state: true })
        } else {
            $.post("/toggle", { id: 2, state: false })
        }
    })
})