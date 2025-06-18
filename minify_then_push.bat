@echo off
echo 🔧 Running minification before push...
python minify_assets.py

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Minification failed. Push aborted.
    exit /b 1
)

echo ✅ Minification successful. Now pushing to Git...
git push

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Git push failed.
    exit /b 1
) ELSE (
    echo 🎉 Push completed successfully.
)
pause
