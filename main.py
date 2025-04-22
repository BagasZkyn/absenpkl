import requests

session = requests.Session()

# Login
login = session.post(
    "https://absenpkl.stmbksimo.com/sw-proses?action=login",
    files={
        "email": ("", "13636@gmail.com"),
        "password": ("", "13636")
    },
    headers={
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://absenpkl.stmbksimo.com/"
    }
)

if "success" in login.text.lower():
    absen = session.post(
        "https://absenpkl.stmbksimo.com/sw-proses?action=absent",
        data={
            "qrcode": "2025/53ECC/SW2025-03-21",
            "latitude": "-7.530607277797366,110.58327667415142",
            "radius": "2"
        },
        headers={
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://absenpkl.stmbksimo.com/absent"
        }
    )
    print("Absen sukses:", absen.text)
else:
    print("Login gagal:", login.text)
