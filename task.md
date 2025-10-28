The hng-stage2-twig project is currently being mis-deployed on Railway as a PHP project, which is why we are getting this error:

Fatal error: Uncaught Twig\Error\LoaderError: The "/var/www/html/templates" directory does not exist


The root cause: Railway is detecting PHP because there’s either a .twig folder named templates/ or no package.json with a proper Node start script. Our project is Node.js + Express + Twig (JS), so we need to force Railway to use Node.

Please follow these steps carefully:

Ensure Node runtime is detected

Make sure package.json exists at the root of the project.

Add or update the scripts section to include:

"scripts": {
  "start": "node server.js"
}


Make sure server.js is at the root and contains the fixed Railway-ready Express + Twig setup.

Rename template folder

Rename templates/ → views/.

Twig templates must be inside views/ or its subfolders:

views/
├── index.twig
├── dashboard.twig
├── 404.twig
├── auth/
│   ├── login.twig
│   └── signup.twig
└── tickets/
    ├── list.twig
    ├── create.twig
    └── edit.twig


Remove any PHP files

Delete index.php or any other .php files from the project root.

Check static assets

All CSS, JS, and images should remain in public/.

References in .twig files should use paths like:

<link rel="stylesheet" href="/css/style.css">
<script src="/js/main.js"></script>


Verify server.js config

Ensure server.js has these lines:

app.set("view engine", "twig");
app.set("views", path.join(__dirname, "views"));
twig.cache(false);


Commit and push

Commit all changes to GitHub with a clear message, e.g.:
"Fix Node runtime detection and views folder for Railway deployment"

Push → trigger a manual deployment on Railway if needed.

Verify

Open the Railway public URL.

Check that Node server runs, Twig templates render, and static assets load.

Follow this checklist strictly — if any step is missed, Railway will still detect PHP and break the deployment.