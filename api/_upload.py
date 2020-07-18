import os
from json import load

import cloudinary.uploader


def upload(imgurl):
    try:
        imgurl = imgurl["full"] if isinstance(imgurl, dict) else imgurl
        if "nopicture" in imgurl:
            return 0
        clapi_key = os.environ.get("key")
        clapi_secret = os.environ.get("cl_secret")
        if clapi_key is None:
            with open("env.json", "r") as f:
                js = load(f)["cloudinary"]
                clapi_key, clapi_secret = js["clapi_key"], js["clapi_secret"]
        cloudinary.config(
            cloud_name="cdn-media-proxy", api_key=clapi_key, api_secret=clapi_secret
        )
        a = cloudinary.uploader.upload(imgurl)["secure_url"]
        return a
    except Exception as e:
        print(e)
        return 0


if __name__ == "__main__":
    data = upload(input("enter url:"))
    print("Raw Data:%s\n\n" % (data))
