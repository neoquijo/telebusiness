"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCreateFilterMutation } from "../../../API/filtersApi"
import Input from "../../../shared/components/UI/Input/Input"
import TextBox from "../../../shared/components/UI/Textbox/Textbox"
import Checkbox from "../../../shared/components/UI/Checkbox/Checkbox"
import Button from "../../../shared/components/UI/Button/Button"
import { BsFilter, BsPlus, BsX } from "react-icons/bs"
import { FaCheck, FaTimes, FaCode, FaRobot, FaLayerGroup } from "react-icons/fa"
import { MdSettings } from "react-icons/md"
import { infoSuccess, infoError } from "../../../shared/lib/toastWrapper"
import css from "./CreateFilterPage.module.css"

const CreateFilterPage: React.FC = () => {
  const navigate = useNavigate()
  const [createFilter, { isLoading }] = useCreateFilterMutation()

  const [formData, setFormData] = useState({
    name: "",
    includesText: [""],
    excludesText: [""],
    includesAll: [""],
    includesMedia: false,
    excludesMedia: false,
    regexp: "",
    callbackTopic: "ai_analysis",
    matchGoal: "",
    batchSizeCharacters: 3000,
    batchSizeMessages: 100,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: "includesText" | "excludesText" | "includesAll", index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayItem = (field: "includesText" | "excludesText" | "includesAll") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayItem = (field: "includesText" | "excludesText" | "includesAll", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const filterData = {
      name: formData.name,
      includesText: formData.includesText.filter((text) => text.trim()),
      excludesText: formData.excludesText.filter((text) => text.trim()),
      includesAll: formData.includesAll.filter((text) => text.trim()),
      includesMedia: formData.includesMedia,
      excludesMedia: formData.excludesMedia,
      regexp: formData.regexp || undefined,
      callbackTopic: formData.callbackTopic || undefined,
      matchGoal: formData.matchGoal || undefined,
      batchSizeCharacters: formData.batchSizeCharacters,
      batchSizeMessages: formData.batchSizeMessages,
    }

    if (!filterData.name.trim()) {
      infoError("Название фильтра обязательно")
      return
    }

    if (
      filterData.includesText.length === 0 &&
      filterData.excludesText.length === 0 &&
      filterData.includesAll.length === 0 &&
      !filterData.includesMedia &&
      !filterData.excludesMedia &&
      !filterData.regexp
    ) {
      infoError("Необходимо указать хотя бы одно условие фильтрации")
      return
    }

    try {
      await createFilter(filterData).unwrap()
      infoSuccess("Фильтр успешно создан")
      navigate("/filters")
    } catch (error) {
      infoError("Ошибка при создании фильтра")
    }
  }

  const renderArrayInputs = (fieldName: "includesText" | "excludesText" | "includesAll", placeholder: string) => (
    <div className={css.conditionsList}>
      {formData[fieldName].map((text, index) => (
        <div key={index} className={css.conditionItem}>
          <Input
            value={text}
            onChange={(e) => handleArrayChange(fieldName, index, e.target.value)}
            placeholder={placeholder}
          />
          {formData[fieldName].length > 1 && (
            <Button
              type="button"
              variant="ghost"
              icon={BsX}
              onClick={() => removeArrayItem(fieldName, index)}
              className={css.removeButton}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        icon={BsPlus}
        onClick={() => addArrayItem(fieldName)}
        className={css.addButton}
      >
        Добавить условие
      </Button>
    </div>
  )

  const callbackTopics = [{ value: "ai_analysis", label: "Анализ AI" }]

  return (
    <div className={css.container}>
      <header className={css.header}>
        <div className={css.headerLeft}>
          <h1 className={css.title}>
            <BsFilter className={css.titleIcon} />
            Создание нового фильтра
          </h1>
          <p className={css.subtitle}>Настройте параметры фильтрации для обработки сообщений</p>
        </div>
        <div className={css.headerActions}>
          <Button type="button" variant="secondary" onClick={() => navigate("/filters")}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            icon={FaCheck}
            onClick={handleSubmit}
          >
            {isLoading ? "Создание..." : "Создать фильтр"}
          </Button>
        </div>
      </header>

      <div className={css.content}>
        <form onSubmit={handleSubmit} className={css.form}>
          <div className={css.formGrid}>
            <div className={css.leftColumn}>
              <div className={css.card}>
                <div className={css.cardHeader}>
                  <BsFilter className={css.cardIcon} />
                  <h2 className={css.cardTitle}>Основная информация</h2>
                </div>
                <div className={css.inputGroup}>
                  <Input
                    label="Название фильтра"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Введите название фильтра"
                    required
                  />
                  <div className={css.selectGroup}>
                    <label className={css.selectLabel}>Действие при срабатывании:</label>
                    <select
                      className={css.select}
                      value={formData.callbackTopic}
                      onChange={(e) => handleInputChange("callbackTopic", e.target.value)}
                    >
                      {callbackTopics.map((topic) => (
                        <option key={topic.value} value={topic.value}>
                          {topic.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={css.card}>
                <div className={css.cardHeader}>
                  <FaCheck className={css.cardIcon} />
                  <h2 className={css.cardTitle}>Должно содержать (любое из слов)</h2>
                </div>
                {renderArrayInputs("includesText", "Введите текст для поиска")}
              </div>

              <div className={css.card}>
                <div className={css.cardHeader}>
                  <FaLayerGroup className={css.cardIcon} />
                  <h2 className={css.cardTitle}>Должно содержать ВСЕ слова</h2>
                </div>
                {renderArrayInputs("includesAll", "Введите обязательное слово")}
              </div>
            </div>

            <div className={css.rightColumn}>
              <div className={css.card}>
                <div className={css.cardHeader}>
                  <FaCode className={css.cardIcon} />
                  <h2 className={css.cardTitle}>Регулярное выражение</h2>
                </div>
                <Input
                  value={formData.regexp}
                  onChange={(e) => handleInputChange("regexp", e.target.value)}
                  placeholder="/pattern/flags"
                />
              </div>

              <div className={css.card}>
                <div className={css.cardHeader}>
                  <FaTimes className={css.cardIcon} />
                  <h2 className={css.cardTitle}>НЕ должно содержать</h2>
                </div>
                {renderArrayInputs("excludesText", "Введите исключаемый текст")}
              </div>

              <div className={css.card}>
                <div className={css.cardHeader}>
                  <MdSettings className={css.cardIcon} />
                  <h2 className={css.cardTitle}>Настройки медиа</h2>
                </div>
                <div className={css.mediaSettings}>
                  <Checkbox
                    label="Сообщение должно содержать медиа файлы"
                    checked={formData.includesMedia}
                    onChange={() => handleInputChange("includesMedia", !formData.includesMedia)}
                  />
                  <Checkbox
                    label="Сообщение НЕ должно содержать медиа файлы"
                    checked={formData.excludesMedia}
                    onChange={() => handleInputChange("excludesMedia", !formData.excludesMedia)}
                  />
                </div>
              </div>
            </div>
          </div>

          {formData.callbackTopic === "ai_analysis" && (
            <div className={css.card}>
              <div className={css.cardHeader}>
                <FaRobot className={css.cardIcon} />
                <h2 className={css.cardTitle}>Настройки AI-анализа</h2>
              </div>
              <div className={css.aiSettings}>
                <TextBox
                  label="Цель анализа"
                  value={formData.matchGoal}
                  onChange={(e) => handleInputChange("matchGoal", e.target.value)}
                  placeholder="Опишите, что нужно найти с помощью AI (например, 'Найти сообщения с предложением продажи недвижимости')"
                  rows={2}
                />
                <div className={css.batchSettings}>
                  <div className={css.batchItem}>
                    <label className={css.label}>Размер пакета (символы):</label>
                    <Input
                      type="number"
                      value={formData.batchSizeCharacters.toString()}
                      onChange={(e) =>
                        handleInputChange("batchSizeCharacters", Number.parseInt(e.target.value) || 3000)
                      }
                      min="1000"
                      max="10000"
                    />
                  </div>
                  <div className={css.batchItem}>
                    <label className={css.label}>Размер пакета (сообщения):</label>
                    <Input
                      type="number"
                      value={formData.batchSizeMessages.toString()}
                      onChange={(e) => handleInputChange("batchSizeMessages", Number.parseInt(e.target.value) || 100)}
                      min="10"
                      max="500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default CreateFilterPage
