function submit(){
  document.body.classList.add('active')
  $("#map").show();
  $("#introForm").hide();
  $("#animation").hide();
  let age = $("#age").val();
  let gender = $("#gender").val();
  let transportation = $("#transportation").val();
}