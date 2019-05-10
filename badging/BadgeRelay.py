# Take in HTTPS request
  # Verify the request's origin/referer against a known set (our classes).
  # If HTTPS request is from wrong origin, fail silently.
  # If HTTPS request is from right origin...
    # Get learner's user ID from the HTTP request
    # Get HarvardX's issuer auth token from (our storage site)
    # Use those to create new request for badge server
    # Send request to badge server
    # If the badge request succeeds...
      # Send back badge data
    # If the badge request fails for auth reasons...
      # Request new auth token.
      # If the auth token request succeeds...
        # Store the token in (our storage site)
        # Re-send the badge request
      # If the auth token request fails...
        # Send back an error message
        # Notify HarvardX
    # If the badge request fails for other reasons...
      # Send back the error message.
