import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { resolveSiteImage } from '../content/siteSettingsDefaults';
import {
  PAYMENT_METHODS,
  createEmptyPaymentLinks,
  normalizePaymentLinks,
} from '../content/paymentMethods';
import {
  HERO_IMAGE_PREPARATION_OPTIONS,
  prepareImageFileForUpload,
} from '../utils/prepareImageFilesForUpload';
import AdminModalShell from './AdminModalShell';
import ConfirmDialog from './ConfirmDialog';
import ImageFocusEditor from './ImageFocusEditor';

const HOMEPAGE_TEAM_CARD_PREVIEW_RATIO = '296 / 160';

const createTeamMemberKey = () =>
  `member-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyTeamMember = () => ({
  key: createTeamMemberKey(),
  name: '',
  email: '',
  phone: '',
  payment_links: createEmptyPaymentLinks(),
  imageKey: '',
  image: null,
});

const reindexIndexedRecord = (record = {}, removedIndex) =>
  Object.entries(record || {}).reduce((next, [key, value]) => {
    const index = Number.parseInt(key, 10);

    if (Number.isNaN(index) || index === removedIndex) {
      return next;
    }

    next[index > removedIndex ? index - 1 : index] = value;
    return next;
  }, {});

function HomeTeamEditorModal({
  heading,
  members,
  imageFiles,
  setImageFiles,
  onSave,
  onCancel,
  isSaving,
  modalTitle = 'Edit team',
  modalDescription = null,
}) {
  const [previewUrls, setPreviewUrls] = useState({});
  const [activeMemberIndex, setActiveMemberIndex] = useState(0);
  const [isPreparingImageIndex, setIsPreparingImageIndex] = useState(null);
  const [memberImageSnapshots, setMemberImageSnapshots] = useState({});
  const [pendingDeleteMemberIndex, setPendingDeleteMemberIndex] = useState(null);

  useEffect(() => {
    const objectUrls = [];
    const nextPreviewUrls = {};

    Object.entries(imageFiles || {}).forEach(([index, file]) => {
      if (!file) {
        return;
      }

      const nextUrl = URL.createObjectURL(file);
      objectUrls.push(nextUrl);
      nextPreviewUrls[index] = nextUrl;
    });

    setPreviewUrls(nextPreviewUrls);

    return () => {
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, [imageFiles]);

  useEffect(() => {
    setActiveMemberIndex((current) =>
      Math.min(current, Math.max(members.value.length - 1, 0))
    );
  }, [members.value.length]);

  const updateHeading = (language, value) => {
    heading.set((current) => ({
      ...current,
      [language]: value,
    }));
  };

  const updateMember = (index, key, value) => {
    members.set((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [key]: value,
            }
          : member
      )
    );
  };

  const updatePaymentLink = (memberIndex, methodName, value) => {
    members.set((current) =>
      current.map((member, index) =>
        index === memberIndex
          ? {
              ...member,
              payment_links: normalizePaymentLinks(member.payment_links).map((entry) =>
                entry.name === methodName ? { ...entry, link: value } : entry
              ),
            }
          : member
      )
    );
  };

  const setMemberFile = (index, file) => {
    setImageFiles((current) => {
      const next = { ...current };

      if (file) {
        next[index] = file;
      } else {
        delete next[index];
      }

      return next;
    });
  };

  const setMemberImageSnapshot = (index, image) => {
    setMemberImageSnapshots((current) => ({
      ...current,
      [index]: image ? JSON.parse(JSON.stringify(image)) : null,
    }));
  };

  const clearMemberImageSnapshot = (index) => {
    setMemberImageSnapshots((current) => {
      const next = { ...current };
      delete next[index];
      return next;
    });
  };

  const resetMemberImageEditorState = (index, fileName = '') => {
    members.set((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              image: {
                ...(member.image || {}),
                name: fileName,
                focusX: 50,
                focusY: 50,
                zoom: 1,
              },
            }
          : member
      )
    );
  };

  const updateMemberImageFocus = (index, focus) => {
    members.set((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              image: {
                ...(member.image || {}),
                ...focus,
              },
            }
          : member
      )
    );
  };

  const restoreMemberImageSnapshot = (index) => {
    const snapshot = memberImageSnapshots[index];

    members.set((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              image: snapshot ? JSON.parse(JSON.stringify(snapshot)) : snapshot,
            }
          : member
      )
    );
    setMemberFile(index, null);
    clearMemberImageSnapshot(index);
  };

  const addMember = () => {
    const nextMemberIndex = members.value.length;

    members.set((current) => [...current, createEmptyTeamMember()]);
    setActiveMemberIndex(nextMemberIndex);
  };

  const removeMember = (index) => {
    const nextMemberCount = Math.max(members.value.length - 1, 0);

    members.set((current) => current.filter((_member, memberIndex) => memberIndex !== index));
    setImageFiles((current) => reindexIndexedRecord(current, index));
    setMemberImageSnapshots((current) => reindexIndexedRecord(current, index));
    setIsPreparingImageIndex((current) => {
      if (current === null) {
        return current;
      }

      if (current === index) {
        return null;
      }

      return current > index ? current - 1 : current;
    });
    setActiveMemberIndex((current) => {
      if (nextMemberCount === 0) {
        return 0;
      }

      if (current > index) {
        return current - 1;
      }

      if (current < index) {
        return current;
      }

      return Math.min(index, nextMemberCount - 1);
    });
  };

  const openDeleteMemberDialog = (index) => {
    setPendingDeleteMemberIndex(index);
  };

  const closeDeleteMemberDialog = () => {
    setPendingDeleteMemberIndex(null);
  };

  const confirmDeleteMember = () => {
    if (pendingDeleteMemberIndex === null) {
      return;
    }

    removeMember(pendingDeleteMemberIndex);
    closeDeleteMemberDialog();
  };

  const handleMemberFileSelected = async (index, file) => {
    if (!file) {
      setMemberFile(index, null);
      return;
    }

    setIsPreparingImageIndex(index);

    try {
      if (!(index in memberImageSnapshots)) {
        setMemberImageSnapshot(index, members.value[index]?.image || null);
      }

      const preparedFile = await prepareImageFileForUpload(
        file,
        HERO_IMAGE_PREPARATION_OPTIONS
      );

      if (!preparedFile) {
        return;
      }

      setMemberFile(index, preparedFile);
      resetMemberImageEditorState(index, preparedFile.name);
    } catch (error) {
      toast.error(error?.message || 'Image optimization failed.');
    } finally {
      setIsPreparingImageIndex(null);
    }
  };

  const activeMember = members.value[activeMemberIndex] || null;
  const activePreviewUrl = activeMember
    ? previewUrls[activeMemberIndex] ||
      resolveSiteImage(activeMember.image, activeMember.imageKey)
    : '';
  const activeImageFile = imageFiles[activeMemberIndex] || null;
  const activePaymentLinks = normalizePaymentLinks(activeMember?.payment_links);
  const isPreparingActiveImage = isPreparingImageIndex === activeMemberIndex;
  const fileButtonLabel = isPreparingActiveImage ? 'Preparing image…' : 'Choose file';
  const areMemberActionsDisabled = isSaving || isPreparingImageIndex !== null;

  return (
    <AdminModalShell
      eyebrow="Team directory"
      title={modalTitle}
      description={modalDescription}
      onClose={onCancel}
      extraWide
    >
      <form onSubmit={onSave} className="story-admin-form">
        <div className="story-admin-grid two">
          <label>
            Heading (EN)
            <input
              type="text"
              value={heading.value.en}
              onChange={(event) => updateHeading('en', event.target.value)}
            />
          </label>
          <label>
            Heading (ET)
            <input
              type="text"
              value={heading.value.ee}
              onChange={(event) => updateHeading('ee', event.target.value)}
            />
          </label>
        </div>

        <div className="home-team-editor">
          <div className="home-team-editor__header">
            <div className="home-team-editor__actions">
              <button
                type="button"
                className="story-admin-button story-admin-button--secondary"
                onClick={addMember}
                disabled={areMemberActionsDisabled}
              >
                Add member
              </button>
              {activeMember ? (
                <button
                  type="button"
                  className="story-admin-button story-admin-button--danger"
                  onClick={() => openDeleteMemberDialog(activeMemberIndex)}
                  disabled={areMemberActionsDisabled}
                >
                  Delete member
                </button>
              ) : null}
            </div>
          </div>

          {members.value.length ? (
            <div className="home-team-editor__tabs" role="tablist" aria-label="Team members">
              {members.value.map((member, index) => {
                const previewUrl =
                  previewUrls[index] || resolveSiteImage(member.image, member.imageKey);
                const memberSummary = member.email || member.phone || 'New member';

                return (
                  <button
                    key={member.key}
                    type="button"
                    className={`home-team-editor__tab${
                      index === activeMemberIndex ? ' is-active' : ''
                    }`}
                    onClick={() => setActiveMemberIndex(index)}
                    role="tab"
                    aria-selected={index === activeMemberIndex}
                  >
                    <span
                      className="home-team-editor__tab-thumb"
                      style={{ backgroundImage: `url(${previewUrl})` }}
                      aria-hidden="true"
                    />
                    <span className="home-team-editor__tab-copy">
                      <strong>{member.name || `Member ${index + 1}`}</strong>
                      <span>{memberSummary}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeMember ? (
            <div className="home-team-editor__workspace">
              <div className="home-team-editor__fields home-editor-card">
                <div className="story-admin-grid two">
                  <label>
                    Name
                    <input
                      type="text"
                      value={activeMember.name}
                      onChange={(event) =>
                        updateMember(activeMemberIndex, 'name', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={activeMember.email}
                      onChange={(event) =>
                        updateMember(activeMemberIndex, 'email', event.target.value)
                      }
                    />
                  </label>
                </div>

                <label>
                  Phone
                  <input
                    type="text"
                    value={activeMember.phone}
                    onChange={(event) =>
                      updateMember(activeMemberIndex, 'phone', event.target.value)
                    }
                  />
                </label>

                <div className="home-team-editor__payments">
                  {PAYMENT_METHODS.map((methodName) => (
                    <label key={methodName}>
                      {methodName}
                      <input
                        type="url"
                        value={
                          activePaymentLinks.find((entry) => entry.name === methodName)?.link || ''
                        }
                        onChange={(event) =>
                          updatePaymentLink(activeMemberIndex, methodName, event.target.value)
                        }
                        placeholder={`https://${methodName
                          .toLowerCase()
                          .replace(/\s+/g, '')}.com/...`}
                      />
                    </label>
                  ))}
                </div>

                <label>
                  Upload image
                  <span
                    className={`story-admin-file-picker${
                      isPreparingActiveImage ? ' is-disabled' : ''
                    }`}
                  >
                    <input
                      className="story-admin-file-picker__input"
                      type="file"
                      accept="image/*"
                      disabled={isPreparingActiveImage}
                      onChange={async (event) => {
                        const nextFile = event.target.files?.[0] || null;
                        event.target.value = '';
                        await handleMemberFileSelected(activeMemberIndex, nextFile);
                      }}
                    />
                    <span className="story-admin-file-picker__button">{fileButtonLabel}</span>
                  </span>
                </label>
              </div>

              <div className="home-team-editor__media home-editor-card">
                {activeImageFile ? (
                  <div className="home-team-editor__media-actions">
                    <button
                      type="button"
                      className="story-admin-button story-admin-button--secondary"
                      onClick={() => restoreMemberImageSnapshot(activeMemberIndex)}
                    >
                      Use current
                    </button>
                  </div>
                ) : null}

                <ImageFocusEditor
                  image={activeMember.image}
                  imageUrl={activePreviewUrl}
                  onChange={(focus) => updateMemberImageFocus(activeMemberIndex, focus)}
                  aspectRatio={HOMEPAGE_TEAM_CARD_PREVIEW_RATIO}
                  label={null}
                  helpText={null}
                  allowZoom
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="story-admin-actions">
          <button
            type="submit"
            className="story-admin-button story-admin-button--primary"
            disabled={isSaving || isPreparingImageIndex !== null}
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            className="story-admin-button story-admin-button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
      <ConfirmDialog
        open={pendingDeleteMemberIndex !== null}
        title="Are you sure?"
        message=""
        confirmLabel="Yes"
        cancelLabel="No"
        eyebrow={null}
        hideClose
        noBackdropBlur
        minimal
        onCancel={closeDeleteMemberDialog}
        onConfirm={confirmDeleteMember}
      />
    </AdminModalShell>
  );
}

export default HomeTeamEditorModal;
