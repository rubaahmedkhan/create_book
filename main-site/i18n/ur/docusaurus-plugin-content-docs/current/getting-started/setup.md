---
sidebar_position: 3
---

# ماحول کی تیاری

فزیکل اے آئی کورس کے لیے اپنے ڈیولپمنٹ ماحول کو تیار کریں۔

## قدم 1: Ubuntu 22.04 LTS انسٹال کریں

مندرجہ ذیل میں سے ایک منتخب کریں:

- **نیٹو انسٹالیشن**: بہترین کارکردگی (ڈوئل بوٹ یا مخصوص مشین)
- **WSL2 (Windows)**: ڈیولپمنٹ کے لیے اچھا، GPU کی حدود ہو سکتی ہیں
- **Docker**: پورٹیبل لیکن اضافی کنفیگریشن کی ضرورت ہے

## قدم 2: ROS 2 Humble انسٹال کریں

```bash
# ROS 2 ریپوزٹری شامل کریں
sudo apt update && sudo apt install software-properties-common
sudo add-apt-repository universe
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

# ROS 2 Humble Desktop انسٹال کریں
sudo apt update
sudo apt install ros-humble-desktop
```

## قدم 3: کوڈ مثالیں کلون کریں

```bash
git clone https://github.com/[org]/physical-ai-examples.git
cd physical-ai-examples
./setup.sh
```

## قدم 4: انسٹالیشن کی تصدیق کریں

```bash
source /opt/ros/humble/setup.bash
ros2 --version
```

متوقع آؤٹ پٹ: `ros2 cli version 0.25.x`

## اگلے قدم

سیکھنا شروع کرنے کے لیے [ماڈیول 1: ROS 2 بنیادی باتیں](../modules/module1-overview) پر جائیں!
