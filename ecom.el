;;; -*- lexical-binding: t -*-

(require 'elnode)
(require 'json)
(require 's)
(require 'rx)
(require 'file-format)

(defconst ecom/docroot (expand-file-name "ecom-webapp")
  "The root of our webapp.")

(defconst ecom/datadir (expand-file-name "data")
  "Where we store all the data.")

(defun ecom-item (httpcon)
  "Handle item posts."
  (let* ((uuid (elnode-http-mapping httpcon 1))
         (path (concat uuid "/data"))
         (file (expand-file-name path ecom/datadir)))
    (elnode-method httpcon
      (GET
       (when (elnode-under-docroot-p file ecom/datadir t)
         (with-temp-buffer
           (insert-file-contents-literally file)
           (elnode-send-json httpcon (progn (goto-char (point-min))(json-read))))))
      (POST
       (if (not (elnode-under-docroot-p file ecom/datadir t))
           (elnode-send-400 httpcon "Bad path")
           ;; Else save it
           (let* ((params (elnode-http-params httpcon)))
             (make-directory (file-name-directory file) t)
             (with-temp-file file (insert (format "%s" (json-encode params))))
             (elnode-send-redirect httpcon path)))))))

(defun ecom-item-image (httpcon)
  "Handle item image uploads."
  (elnode-method httpcon
    (GET (elnode-send-json httpcon '("Ok")))
    (POST
     (let* ((item-uuid (elnode-http-mapping httpcon 1))
            (image-uuid (elnode-http-mapping httpcon 2))
            (image-data (elnode-http-param httpcon "image-data"))
            (image-path (s-format
                         "${item-uuid}/images/${image-uuid}" 'aget
                         `(("item-uuid" . ,item-uuid)
                           ("image-uuid" . ,image-uuid))))
            (image-file (expand-file-name image-path ecom/datadir))
            (coding-system-for-write 'raw-text))
       (if (not (elnode-under-docroot-p image-file ecom/datadir t))
           (elnode-send-400 httpcon "Bad path")
           ;; Else it's ok, save the image and send a redirect
           (make-directory (file-name-directory image-file) t)
           (with-temp-file image-file (insert image-data))
           (elnode-send-status httpcon 201))))))

(defun ecom-ws (httpcon)
  (let ((elnode-send-file-assoc
         '(("\\.js$" . elnode-js/browserify-send-func))))
    (elnode--webserver-handler-proc
     httpcon ecom/docroot elnode-webserver-extra-mimetypes)))

(defconst ecom/uuid-pattern
  (rx (group (= 8 hex-digit) "-"
             (= 3 (= 4 hex-digit) "-")
             (= 12 hex-digit)
             string-end))
  "A regex to match UUIDs.")

(defun ecom-router (httpcon)
  "Routing for the ecommerce system."
  (elnode-hostpath-dispatcher
   httpcon
   (let ((uuid-pat ecom/uuid-pattern))
     (list
      (cons (concat "^[^/]+//item/" uuid-pat "/image/" uuid-pat "$") 'ecom-item-image)
      (cons (concat "^[^/]+//item/" uuid-pat) 'ecom-item)
      (cons "^[^/]+//.*"  'ecom-ws)))
   :log-name "ecom"))

;;; ecom.el ends here
