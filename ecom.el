;;; -*- lexical-binding: t -*-

(defconst ecom/docroot (expand-file-name "ecom-webapp"))

(defun ecom-ws (httpcon)
  (let ((elnode-send-file-assoc
         '(("\\.js$" . elnode-js/browserify-send-func))))
    (elnode--webserver-handler-proc
     httpcon ecom/docroot elnode-webserver-extra-mimetypes)))

(defun ecom-item (httpcon)
  (elnode-method httpcon
    (POST
     (let ((response (elnode-http-params httpcon)))
       (message "the response is: %s" response)
       (elnode-send-json httpcon response)))))

(defun ecom-router (httpcon)
  "Routing for the ecommerce system."
  (elnode-hostpath-dispatcher
   httpcon
   `(("^[^/]+//item/" . ecom-item)
     ("^[^/]+//.*" . ecom-ws))))

(elnode-start 'ecom-router :port 8018 :host "0.0.0.0")

;;; ecom.el ends here
