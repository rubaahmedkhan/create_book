"use client";

import React from "react";

/**
 * Hardware Background Questionnaire Section
 *
 * Collects information about user's hardware/robotics experience.
 */
interface HardwareBackgroundProps {
  data: HardwareBackgroundData;
  onChange: (data: HardwareBackgroundData) => void;
}

export interface HardwareBackgroundData {
  hardware_experience_years: number;
  microcontrollers_used: string[];
  sensors_actuators_used: string[];
  circuit_design_experience: boolean;
  soldering_experience: boolean;
  hardware_projects_completed: number;
}

const MICROCONTROLLERS = [
  "Arduino", "Raspberry Pi", "ESP32/ESP8266", "STM32", "Teensy", "BeagleBone", "Other", "None"
];

const SENSORS_ACTUATORS = [
  "Motors (DC/Servo/Stepper)", "Cameras", "LIDAR", "Ultrasonic sensors", "IMU/Gyroscope",
  "GPS", "Temperature sensors", "Pressure sensors", "Other"
];

export default function HardwareBackground({ data, onChange }: HardwareBackgroundProps) {
  const handleCheckboxChange = (field: "microcontrollers_used" | "sensors_actuators_used", value: string) => {
    const currentValues = data[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({ ...data, [field]: newValues });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Hardware & Robotics Background</h3>

      {/* Years of experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of hardware/robotics experience
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={data.hardware_experience_years || 0}
          onChange={(e) => onChange({ ...data, hardware_experience_years: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Microcontrollers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Microcontrollers and boards used (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MICROCONTROLLERS.map((micro) => (
            <label key={micro} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.microcontrollers_used || []).includes(micro)}
                onChange={() => handleCheckboxChange("microcontrollers_used", micro)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{micro}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sensors and actuators */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sensors and actuators used (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SENSORS_ACTUATORS.map((sensor) => (
            <label key={sensor} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.sensors_actuators_used || []).includes(sensor)}
                onChange={() => handleCheckboxChange("sensors_actuators_used", sensor)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{sensor}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Circuit design */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={data.circuit_design_experience || false}
            onChange={(e) => onChange({ ...data, circuit_design_experience: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            I have experience with circuit design (breadboarding, PCB design)
          </span>
        </label>
      </div>

      {/* Soldering */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={data.soldering_experience || false}
            onChange={(e) => onChange({ ...data, soldering_experience: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            I have soldering experience
          </span>
        </label>
      </div>

      {/* Projects completed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of hardware/robotics projects completed
        </label>
        <input
          type="number"
          min="0"
          max="1000"
          value={data.hardware_projects_completed || 0}
          onChange={(e) => onChange({ ...data, hardware_projects_completed: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
