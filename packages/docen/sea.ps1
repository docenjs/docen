pnpm prepack
pnpm ncc build dist/cli.cjs -o dist/ncc
node --experimental-sea-config sea-config.json
Copy-Item (Get-Command node).Source dist/docen.exe
pnpm postject dist/docen.exe NODE_SEA_BLOB dist/prep.blob `
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2