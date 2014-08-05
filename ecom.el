;;; -*- lexical-binding: t -*-

(defconst ecom/docroot (expand-file-name "ecom-webapp"))

(defun ecom-ws (httpcon)
  (let ((elnode-send-file-assoc
         '(("\\.js$" . elnode-js/browserify-send-func))))
    (elnode--webserver-handler-proc
     httpcon ecom/docroot elnode-webserver-extra-mimetypes)))

(defun ecom-item (httpcon)
  (elnode-send-json httpcon '("Ok")))

(defun ecom-router (httpcon)
  (elnode-hostpath-dispatcher
   httpcon
   `(("^[^/]+//item/.*" . gnudoc-prox)
     ("^[^.]+//.*" . ecom-ws))))

(elnode-start 'ecom-router :port 8018)

;;; ecom.el ends here
