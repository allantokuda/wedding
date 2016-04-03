// Add copy of values nested within /invitation/
invitationRef = ref.child('invitation')
ref.once("value", function(snapshot) {
  Object.keys(snapshot.val()).forEach(function(k) {
    if (k[0] === '-') {
      invitationRef.child(k).set(snapshot.val()[k]);
    }
  });
});

// Remove old values at root
ref.once("value", function(snapshot) {
  Object.keys(snapshot.val()).forEach(function(k) {
    if (k[1] === 'J') {
      ref.child(k).remove();
    }
  });
});
