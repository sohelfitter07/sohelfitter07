@echo off
echo ⚙️ Running minification before push...
python minify_assets.py
if %errorlevel% neq 0 (
    echo ❌ Minification failed. Aborting push.
    pause
    exit /b 1
)

echo ✅ Minification successful. Now pushing to Git...
git push
echo ✅ Push completed successfully.
pause
