;;; ecom-tests.el - tests for the elnode  -*- lexical-binding: t -*-

(require 'elnode-testsupport)
(require 'noflet)

(defconst ecom-tests/image-file (expand-file-name "test-image.png"))

(with-elnode-mock-httpcon :httpcon (:elnode-http-method "POST")
  (equal
   "/item/totally-fake-uuid/images/20140810234013086751009"
   (catch :return
     (let* ((fake-uuid "totally-fake-uuid"))
       (unwind-protect
            (noflet
                ((elnode-http-mapping (httpcon num) fake-uuid)
                 (elnode-http-params (httpcon) ; fake up the image upload
                   `(("image"
                      . ,(let ((coding-system-for-write 'raw-text))
                              (with-temp-buffer
                                (insert-file-contents-literally ecom-tests/image-file)
                                (buffer-string))))))
                 (format-time-string (string time) ; so we have predictable redirects
                   "20140810234013086751009")
                 (elnode-send-redirect (httpcon location)
                   (message "location is: %s" location)
                   (throw :return location)))
              (ecom-item :httpcon))
         ;; And then delete the fake file we uploaded...
         (delete-directory (expand-file-name fake-uuid ecom/datadir) t))))))


;;; ecom-tests.el ends here
