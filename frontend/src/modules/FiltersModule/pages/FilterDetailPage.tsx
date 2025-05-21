import React, { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  useGetFilterQuery,
  useUpdateFilterMutation,
  UpdateFilterDto,
} from "../../../API/filtersApi"
import { FaEdit, FaSave, FaTimes, FaThumbsUp, FaThumbsDown, FaPlay, FaLayerGroup, FaRobot } from "react-icons/fa"
import { MdSettings } from "react-icons/md"
import Button from "../../../shared/components/UI/Button/Button"
import Input from "../../../shared/components/UI/Input/Input"
import TextBox from "../../../shared/components/UI/Textbox/Textbox"
import Checkbox from "../../../shared/components/UI/Checkbox/Checkbox"
import { infoSuccess, infoError } from "../../../shared/lib/toastWrapper"
import { useModalManager } from "../../../core/providers/modal/ModalProvider"
import TestFilterModal from "../modals/TestFilterModal"
import NoData from "../../../shared/components/NoData/NoData"
import css from "./FilterDetailPage.module.css"

interface IProps { }

const FilterDetailPage: React.FC<IProps> = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const modal = useModalManager()
  const isEditMode = searchParams.get("edit") === "true"

  const { data: filter, isFetching, error } = useGetFilterQuery(id!)
  const [updateFilter, { isLoading: isUpdating }] = useUpdateFilterMutation()
  const [isEditing, setIsEditing] = useState(isEditMode)
  const [formData, setFormData] = useState<UpdateFilterDto>({})
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")
  const [includeAllInput, setIncludeAllInput] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (filter) {
      setFormData({
        name: filter.name,
        includesText: [...(filter.includesText || [])],
        excludesText: [...(filter.excludesText || [])],
        includesAll: [...(filter.includesAll || [])],
        includesMedia: filter.includesMedia,
        excludesMedia: filter.excludesMedia,
        regexp: filter.regexp || "",
        callbackTopic: filter.callbackTopic || "",
        matchGoal: filter.matchGoal || "",
        batchSizeCharacters: filter.batchSizeCharacters,
        batchSizeMessages: filter.batchSizeMessages,
      })
    }
  }, [filter])

  const validateRegex = (pattern: string): boolean => {
    if (!pattern) return true
    try {
      new RegExp(pattern)
      return true
    } catch {
      return false
    }
  }

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Название фильтра обязательно"
    }

    if (formData.regexp && !validateRegex(formData.regexp)) {
      newErrors.regexp = "Некорректное регулярное выражение"
    }

    if (
      (formData.includesText?.length || 0) === 0 &&
      (formData.excludesText?.length || 0) === 0 &&
      (formData.includesAll?.length || 0) === 0 &&
      !formData.includesMedia &&
      !formData.excludesMedia &&
      !formData.regexp
    ) {
      newErrors.general = "Укажите хотя бы одно условие фильтрации"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      infoError("Пожалуйста, исправьте ошибки в форме")
      return
    }

    try {
      await updateFilter({ id: id!, data: formData }).unwrap()
      infoSuccess("Фильтр обновлен успешно")
      setIsEditing(false)
      navigate(`/filters/${id}`)
    } catch (error) {
      infoError("Ошибка при обновлении фильтра")
      console.error("Update filter error:", error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: filter?.name,
      includesText: [...(filter?.includesText || [])],
      excludesText: [...(filter?.excludesText || [])],
      includesAll: [...(filter?.includesAll || [])],
      includesMedia: filter?.includesMedia,
      excludesMedia: filter?.excludesMedia,
      regexp: filter?.regexp || "",
      callbackTopic: filter?.callbackTopic || "",
      matchGoal: filter?.matchGoal || "",
      batchSizeCharacters: filter?.batchSizeCharacters,
      batchSizeMessages: filter?.batchSizeMessages,
    })
    setErrors({})
    navigate(`/filters/${id}`)
  }

  const addTextItem = (
    field: "includesText" | "excludesText" | "includesAll",
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const text = value.trim()
    if (text && !(formData[field] || []).includes(text)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), text],
      }))
      setter("")
      if (errors.general) {
        setErrors((prev) => ({ ...prev, general: "" }))
      }
    }
  }

  const removeTextItem = (field: "includesText" | "excludesText" | "includesAll", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }))
  }

  const handleTest = () => {
    modal.openModal(
      "testFilter",
      <TestFilterModal
        filterId={id!}
        filterName={filter?.name || ""}
        hasMediaOption={filter?.includesMedia || filter?.excludesMedia}
      />,
      { title: `Тестирование фильтра: ${filter?.name}` },
    )
  }

  const callbackTopics = [
    { value: "", label: "Нет действия" },
    { value: "webhook", label: "Webhook уведомление" },
    { value: "email", label: "Email уведомление" },
    { value: "log", label: "Запись в лог" },
    { value: "telegram", label: "Telegram бот" },
    { value: "database", label: "Сохранить в базу" },
    { value: "ai_analysis", label: "Анализ AI" },
  ]

  if (isFetching) {
    return (
      <div className={css.loading}>
        <div className={css.loadingText}>Загрузка фильтра...</div>
      </div>
    )
  }

  if (error || !filter) {
    return (
      <div className={css.wrapper}>
        <NoData
          text="Фильтр не найден"
          subText="Возможно, фильтр был удален или у вас нет доступа к нему"
        />
      </div>
    )
  }

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.titleSection}>
          <h1 className={css.title}>{isEditing ? "Редактирование фильтра" : filter.name}</h1>
          <div className={css.metadata}>
            <span>Создан: {new Date(filter.createdAt).toLocaleDateString("ru-RU")}</span>
            <span>•</span>
            <span>Обновлен: {new Date(filter.updatedAt).toLocaleDateString("ru-RU")}</span>
          </div>
        </div>

        <div className={css.actions}>
          {!isEditing ? (
            <>
              <Button icon={FaPlay} onClick={handleTest} variant="ghost">
                Тестировать
              </Button>
              <Button icon={FaEdit} onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            </>
          ) : (
            <>
              <Button icon={FaTimes} variant="ghost" onClick={handleCancel}>
                Отменить
              </Button>
              <Button icon={FaSave} onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? "Сохранение..." : "Сохранить"}
              </Button>
            </>
          )}
        </div>
      </div>

      {errors.general && (
        <div className={css.generalError}>
          <FaTimes className={css.errorIcon} />
          {errors.general}
        </div>
      )}

      <div className={css.content}>
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Основная информация</h3>
            <div className={css.sectionIcon}>📝</div>
          </div>

          {isEditing ? (
            <div className={css.editSection}>
              <Input
                label="Название фильтра *"
                value={formData.name || ""}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                }}
                placeholder="Введите название фильтра"
                required
              />

              <div className={css.inputGroup}>
                <label className={css.label}>Действие при срабатывании</label>
                <select
                  className={css.select}
                  value={formData.callbackTopic || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, callbackTopic: e.target.value }))}
                >
                  {callbackTopics.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className={css.viewSection}>
              <div className={css.infoItem}>
                <span className={css.infoLabel}>Название:</span>
                <span className={css.infoValue}>{filter.name}</span>
              </div>
              <div className={css.infoItem}>
                <span className={css.infoLabel}>Действие:</span>
                <span className={css.infoValue}>
                  {filter.callbackTopic
                    ? callbackTopics.find((t) => t.value === filter.callbackTopic)?.label || filter.callbackTopic
                    : "Нет действия"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Текстовые условия</h3>
            <div className={css.sectionIcon}>🔍</div>
          </div>

          <div className={css.conditionsContainer}>
            {/* Includes Any Words Section */}
            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <FaThumbsUp className={css.includeIcon} />
                <span className={css.conditionLabel}>Должно содержать хотя бы одно из слов:</span>
              </div>

              {isEditing ? (
                <>
                  <div className={css.inputWithButton}>
                    <Input
                      value={includeInput}
                      onChange={(e) => setIncludeInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTextItem("includesText", includeInput, setIncludeInput))
                      }
                      placeholder="Добавить слово или фразу..."
                    />
                    <Button
                      onClick={() => addTextItem("includesText", includeInput, setIncludeInput)}
                      disabled={!includeInput.trim()}
                    >
                      Добавить
                    </Button>
                  </div>

                  {(formData.includesText?.length || 0) > 0 && (
                    <div className={css.tags}>
                      {(formData.includesText || []).map((text, index) => (
                        <div key={index} className={`${css.tag} ${css.includeTag}`}>
                          <span>{text}</span>
                          <Button
                            variant="ghost"
                            icon={FaTimes}
                            onClick={() => removeTextItem("includesText", index)}
                            className={css.removeTag}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={css.tags}>
                  {filter.includesText && filter.includesText.length > 0 ? (
                    filter.includesText.map((text, index) => (
                      <span key={index} className={`${css.tag} ${css.includeTag}`}>
                        {text}
                      </span>
                    ))
                  ) : (
                    <span className={css.emptyText}>Не указано</span>
                  )}
                </div>
              )}
            </div>

            {/* Includes All Words Section */}
            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <FaLayerGroup className={css.includeAllIcon} />
                <span className={css.conditionLabel}>Должно содержать ВСЕ слова:</span>
              </div>

              {isEditing ? (
                <>
                  <div className={css.inputWithButton}>
                    <Input
                      value={includeAllInput}
                      onChange={(e) => setIncludeAllInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addTextItem("includesAll", includeAllInput, setIncludeAllInput))
                      }
                      placeholder="Добавить обязательное слово..."
                    />
                    <Button
                      onClick={() => addTextItem("includesAll", includeAllInput, setIncludeAllInput)}
                      disabled={!includeAllInput.trim()}
                    >
                      Добавить
                    </Button>
                  </div>

                  {(formData.includesAll?.length || 0) > 0 && (
                    <div className={css.tags}>
                      {(formData.includesAll || []).map((text, index) => (
                        <div key={index} className={`${css.tag} ${css.includeAllTag}`}>
                          <span>{text}</span>
                          <Button
                            variant="ghost"
                            icon={FaTimes}
                            onClick={() => removeTextItem("includesAll", index)}
                            className={css.removeTag}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={css.tags}>
                  {filter.includesAll && filter.includesAll.length > 0 ? (
                    filter.includesAll.map((text, index) => (
                      <span key={index} className={`${css.tag} ${css.includeAllTag}`}>
                        {text}
                      </span>
                    ))
                  ) : (
                    <span className={css.emptyText}>Не указано</span>
                  )}
                </div>
              )}
            </div>

            {/* Excludes Words Section */}
            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <FaThumbsDown className={css.excludeIcon} />
                <span className={css.conditionLabel}>Не должно содержать:</span>
              </div>

              {isEditing ? (
                <>
                  <div className={css.inputWithButton}>
                    <Input
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTextItem("excludesText", excludeInput, setExcludeInput))
                      }
                      placeholder="Добавить исключаемое слово или фразу..."
                    />
                    <Button
                      onClick={() => addTextItem("excludesText", excludeInput, setExcludeInput)}
                      disabled={!excludeInput.trim()}
                    >
                      Добавить
                    </Button>
                  </div>

                  {(formData.excludesText?.length || 0) > 0 && (
                    <div className={css.tags}>
                      {(formData.excludesText || []).map((text, index) => (
                        <div key={index} className={`${css.tag} ${css.excludeTag}`}>
                          <span>{text}</span>
                          <Button
                            variant="ghost"
                            icon={FaTimes}
                            onClick={() => removeTextItem("excludesText", index)}
                            className={css.removeTag}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={css.tags}>
                  {filter.excludesText && filter.excludesText.length > 0 ? (
                    filter.excludesText.map((text, index) => (
                      <span key={index} className={`${css.tag} ${css.excludeTag}`}>
                        {text}
                      </span>
                    ))
                  ) : (
                    <span className={css.emptyText}>Не указано</span>
                  )}
                </div>
              )}
            </div>

            {/* Media Settings Section */}
            <div className={css.conditionGroup}>
              <div className={css.conditionHeader}>
                <MdSettings className={css.mediaIcon} />
                <span className={css.conditionLabel}>Настройки медиа:</span>
              </div>

              {isEditing ? (
                <div className={css.mediaSettings}>
                  <Checkbox
                    label="Сообщение должно содержать медиа"
                    checked={formData.includesMedia || false}
                    onChange={() => setFormData((prev) => ({ ...prev, includesMedia: !prev.includesMedia }))}
                  />
                  <Checkbox
                    label="Сообщение НЕ должно содержать медиа"
                    checked={formData.excludesMedia || false}
                    onChange={() => setFormData((prev) => ({ ...prev, excludesMedia: !prev.excludesMedia }))}
                  />
                </div>
              ) : (
                <div className={css.mediaStatus}>
                  {filter.includesMedia && (
                    <div className={css.mediaItem}>
                      <span className={css.mediaRequirement}>Должно содержать медиа</span>
                    </div>
                  )}
                  {filter.excludesMedia && (
                    <div className={css.mediaItem}>
                      <span className={css.mediaRequirement}>НЕ должно содержать медиа</span>
                    </div>
                  )}
                  {!filter.includesMedia && !filter.excludesMedia && (
                    <span className={css.emptyText}>Не указано</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={css.section}>
          <div className={css.sectionHeader}>
            <h3 className={css.sectionTitle}>Регулярное выражение</h3>
            <div className={css.sectionIcon}>#</div>
          </div>

          {isEditing ? (
            <TextBox
              label="Паттерн регулярного выражения"
              value={formData.regexp || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, regexp: e.target.value }))
                if (errors.regexp) setErrors((prev) => ({ ...prev, regexp: "" }))
              }}
              placeholder="Например: \b(важно|срочно|urgent)\b"
              rows={3}
            />
          ) : (
            <div className={css.regexDisplay}>
              {filter.regexp ? (
                <code className={css.regexCode}>{filter.regexp}</code>
              ) : (
                <span className={css.emptyText}>Не указано</span>
              )}
            </div>
          )}
        </div>

        {/* AI Analysis Section (shown only when callback is ai_analysis) */}
        {(isEditing ? formData.callbackTopic === "ai_analysis" : filter.callbackTopic === "ai_analysis") && (
          <div className={css.section}>
            <div className={css.sectionHeader}>
              <h3 className={css.sectionTitle}>
                <FaRobot className={css.sectionIcon} style={{ marginRight: "0.5rem" }} />
                AI-анализ
              </h3>
            </div>

            {isEditing ? (
              <div className={css.aiSettings}>
                <TextBox
                  label="Цель анализа"
                  value={formData.matchGoal || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, matchGoal: e.target.value }))}
                  placeholder="Опишите, что нужно найти с помощью AI (например, 'Найти сообщения с предложением продажи недвижимости')"
                  rows={3}
                />
                <div className={css.batchSettings}>
                  <div className={css.batchItem}>
                    <label className={css.label}>Размер пакета (символы):</label>
                    <Input
                      type="number"
                      value={(formData.batchSizeCharacters || 3000).toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          batchSizeCharacters: parseInt(e.target.value) || 3000,
                        }))
                      }
                      min="1000"
                      max="10000"
                    />
                  </div>
                  <div className={css.batchItem}>
                    <label className={css.label}>Размер пакета (сообщения):</label>
                    <Input
                      type="number"
                      value={(formData.batchSizeMessages || 100).toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          batchSizeMessages: parseInt(e.target.value) || 100,
                        }))
                      }
                      min="10"
                      max="500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={css.aiSettingsView}>
                <div className={css.aiItem}>
                  <span className={css.aiLabel}>Цель анализа:</span>
                  <p className={css.aiGoal}>{filter.matchGoal || "Не указано"}</p>
                </div>
                <div className={css.aiItem}>
                  <span className={css.aiLabel}>Размер пакета:</span>
                  <div className={css.batchInfo}>
                    <span>{filter.batchSizeCharacters || 3000} символов</span>
                    <span>{filter.batchSizeMessages || 100} сообщений</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterDetailPage
