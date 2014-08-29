;;; boot ecom

;;; I'm using this instead of a package because I'm not sure I need a package yet.

(or (package-installed-p 'file-format)
    (package-install 'file-format))
(load-file "./ecom.el")
(elnode-start 'ecom-router :port 8018 :host "0.0.0.0")

;;; end boot ecom
