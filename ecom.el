;;; -*- lexical-binding: t -*-

(require 'elnode)
(require 'json)
(require 'ibuf-macs)
(defalias 'aif 'ibuffer-aif)

(defconst ecom/docroot (expand-file-name "ecom-webapp")
  "The root of our webapp.")

(defconst ecom/datadir (expand-file-name "data")
  "Where we store all the data.")

(defun ecom/expand-item (item)
  "Expand the ITEM into a path under `ecom/datadir'.

Makes sure ITEM is clean of any artifact that could be dangerous.
The directory structure is made if necessary."
  (let ((fq-images
         (expand-file-name
          "images"
          (expand-file-name 
           (file-name-sans-extension
            (file-name-nondirectory item))
           ecom/datadir))))
    ;; Just ignore any errors
    (condition-case err
        (make-directory (file-name-as-directory fq-images) t)
      (file-already-exists nil))
    (file-name-directory fq-images)))

(defun expand-file-under-docroot (file dir docroot)
  "Expand FiLE under DIR but return what's not under DOCROOT.

For example:

  docroot    dir       file     result
  /a/b/c     /a/b/c/d  e        d/e
  /a/b/c     d         e        d/e
"
  (save-match-data
    (let ((str (expand-file-name file (expand-file-name dir docroot))))
      (string-match
       (concat (file-name-as-directory docroot) "\\(.*\\)")
       str)
      (match-string 1 str))))

(defun ecom-item (httpcon)
  (elnode-method httpcon
    (POST
     (let* ((uuid (elnode-http-mapping httpcon 1)) ; FIXME - check the UUID
            (params (elnode-http-params httpcon))
            (uuid-dir (ecom/expand-item uuid))
            (image (kva "image" params)))
       (if image
           (let ((image-file
                  (expand-file-name 
                   (format-time-string "%Y%m%d%H%M%S%N" (current-time))
                   (expand-file-name "images" uuid-dir)))
                 (coding-system-for-write 'raw-text))
             (with-temp-file image-file (insert image))
             (elnode-send-redirect
              httpcon
              (concat
               "/item/"
               (expand-file-under-docroot image-file uuid-dir ecom/datadir))))
           ;; Must be data
           (with-temp-file (expand-file-name "data" uuid-dir)
             (insert (format "%s" (json-encode params))))
           (elnode-send-redirect
            httpcon
            (concat
             "/item/"
             (expand-file-under-docroot "data" uuid-dir ecom/datadir))))))))

(defun ecom-ws (httpcon)
  (let ((elnode-send-file-assoc
         '(("\\.js$" . elnode-js/browserify-send-func))))
    (elnode--webserver-handler-proc
     httpcon ecom/docroot elnode-webserver-extra-mimetypes)))

(defun ecom-router (httpcon)
  "Routing for the ecommerce system."
  (elnode-hostpath-dispatcher
   httpcon
   `(("^[^/]+//item/\\(.*\\)" . ecom-item) ; check the UUID
     ("^[^/]+//.*" . ecom-ws))))

(elnode-start 'ecom-router :port 8018 :host "0.0.0.0")

;;; ecom.el ends here
