@echo off

echo --- Frontend commit ---
git add Barış-Saylık/kitapp-web
git commit -F commit_msg_frontend.txt

echo --- Backend degisiklikleri stashleniyor ---
git stash

echo --- baris-rest-api branchına geciliyor ---
git fetch origin
git branch -a | findstr "baris-rest-api"
if %errorlevel% neq 0 (
  git checkout -b baris-rest-api
) else (
  git checkout baris-rest-api
)

echo --- Backend degisiklikleri baris-rest-api branchına aktarılıyor ---
git stash pop

echo --- Backend commit ---
git add Barış-Saylık/kitapp-api
git commit -m "fix(backend): kitap izolasyonu icin Book modeline userId eklendi ve controller yetkilendirildi"
git push -u origin baris-rest-api

echo --- Orijinal branchımıza donup frontend degisikliklerini pushluyoruz ---
git checkout baris-web-frontend
git push origin baris-web-frontend

echo DONE
