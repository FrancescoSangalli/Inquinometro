window.onload = function() {
  document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    this.user_name.value;
    this.user_email.value;
    this.message.value;
    emailjs.sendForm('service_sm5qyia', 'contact_form', this)
      .then(function() {
        console.log('SUCCESS!');
      }, function(error) {
        console.log('FAILED...', error);
      });
  });
}
